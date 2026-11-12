import { fireEvent, render, screen } from "@testing-library/react-native";

import { paraMapaPostos } from "@/api/borda";
import { termosBloqueados } from "@/lib/politica";
import { mapaDoFio } from "@/testes/apoio";
// O Jest resolve a variante nativa (`MapaPostos.native.tsx`), que é a que tem mapa.
import { MapaPostos } from "@/ui/MapaPostos";

/**
 * O SDK de mapas é nativo e não roda no Jest. O dublê troca cada peça por uma
 * `View` que preserva as props, o bastante para conferir o que o app PEDE ao
 * mapa: quais marcadores, com que rótulo, e o que NÃO é ligado.
 */
jest.mock("react-native-maps", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  const dubles = (nome: string) => {
    const Duble = (props: Record<string, unknown>) => React.createElement(View, { ...props, testID: nome });
    Duble.displayName = nome;
    return Duble;
  };
  return { __esModule: true, default: dubles("mapa"), Marker: dubles("marcador"), Circle: dubles("circulo") };
});

const centro = { latitude: -23.55, longitude: -46.63 };

function pontos() {
  const base = mapaDoFio().itens[0]!;
  return paraMapaPostos(
    mapaDoFio({
      itens: [
        base,
        { ...base, posto_id: "posto-2", razao_social: "POSTO MODELO DA PRACA LTDA", fonte: "GEO-01", latitude: -23.56 },
      ],
    }),
  ).itens;
}

async function montar(props: Partial<React.ComponentProps<typeof MapaPostos>> = {}) {
  const aoSelecionar = jest.fn();
  const aoMoverCentro = jest.fn();
  await render(
    <MapaPostos
      centro={centro}
      raioMetros={5000}
      pontos={pontos()}
      selecionado={null}
      aoSelecionar={aoSelecionar}
      aoMoverCentro={aoMoverCentro}
      {...props}
    />,
  );
  return { aoSelecionar, aoMoverCentro };
}

describe("mapa de postos", () => {
  it("um marcador por posto, com a origem da posição no rótulo", async () => {
    await montar();
    expect(screen.getAllByTestId("marcador")).toHaveLength(2);
    expect(screen.getByLabelText("Posto Exemplo Avenida Ltda.. Posição publicada pela ANP")).toBeTruthy();
    expect(screen.getByLabelText("Posto Modelo da Praca Ltda.. Posição estimada pelo endereço")).toBeTruthy();
  });

  it("não liga a localização exata do usuário: mostra só o círculo consultado", async () => {
    await montar();
    const mapa = screen.getByTestId("mapa");
    expect(mapa.props.showsUserLocation).toBe(false);
    expect(mapa.props.showsMyLocationButton).toBe(false);
    const circulo = screen.getByTestId("circulo");
    expect(circulo.props.center).toEqual(centro);
    expect(circulo.props.radius).toBe(5000);
  });

  it("enquadra o círculo inteiro, com margem", async () => {
    await montar();
    const regiao = screen.getByTestId("mapa").props.initialRegion;
    expect(regiao.latitude).toBe(centro.latitude);
    // 5 km de raio ≈ 0,045° de latitude; o enquadramento precisa cobrir o diâmetro.
    expect(regiao.latitudeDelta).toBeGreaterThan(0.09);
    expect(regiao.longitudeDelta).toBeGreaterThan(regiao.latitudeDelta);
  });

  it("tocar num marcador seleciona o posto; tocar no mapa limpa a seleção", async () => {
    const { aoSelecionar } = await montar();
    await fireEvent(screen.getAllByTestId("marcador")[1]!, "press", { stopPropagation: jest.fn() });
    expect(aoSelecionar).toHaveBeenLastCalledWith("posto-2");
    await fireEvent.press(screen.getByTestId("mapa"));
    expect(aoSelecionar).toHaveBeenLastCalledWith(null);
  });

  it("o marcador selecionado é anunciado como selecionado", async () => {
    await montar({ selecionado: "posto-1" });
    expect(screen.getByLabelText(/Posto Exemplo Avenida Ltda\..*Selecionado/)).toBeTruthy();
  });

  it("só oferece buscar em outra área quando o mapa sai do círculo consultado", async () => {
    const { aoMoverCentro } = await montar();
    const mapa = screen.getByTestId("mapa");
    await fireEvent(mapa, "regionChangeComplete", { latitude: -23.551, longitude: -46.631, latitudeDelta: 0.1, longitudeDelta: 0.1 });
    expect(aoMoverCentro).toHaveBeenLastCalledWith(null);
    await fireEvent(mapa, "regionChangeComplete", { latitude: -23.7, longitude: -46.63, latitudeDelta: 0.1, longitudeDelta: 0.1 });
    expect(aoMoverCentro).toHaveBeenLastCalledWith({ latitude: -23.7, longitude: -46.63 });
  });

  it("nenhum rótulo do mapa fala de preço, resultado ou usa termo bloqueado", async () => {
    await montar();
    const texto = JSON.stringify(screen.toJSON());
    expect(termosBloqueados(texto)).toEqual([]);
    expect(texto).not.toMatch(/R\$|conforme|ranking/i);
  });
});
