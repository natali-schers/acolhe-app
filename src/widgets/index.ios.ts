/**
 * iPhone: registra o widget de SOS.
 * O expo-widgets não existe no app Expo Go, então só carregamos em builds de desenvolvimento/produção.
 */
import Constants, { ExecutionEnvironment } from "expo-constants";

if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
  require("./ios/SosWidget");
}

export {};
