import "axios";
declare module "axios" {
  interface AxiosRequestConfig {
    /**
     * Nếu true => auth injector sẽ bỏ qua (không add Authorization header)
     */
    skipAuth?: boolean;
  }
}
