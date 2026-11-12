/**
 * Preparo comum dos testes: armazenamento e rede do aparelho substituídos por
 * dublês em memória. Nenhum teste toca rede real.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- fábrica de jest.mock não aceita import
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: { addEventListener: jest.fn(() => jest.fn()), fetch: jest.fn() },
}));
