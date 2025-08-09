import "notistack";

declare module "notistack" {
  interface VariantOverrides {
    // adds `myCustomVariant` variant
    errorMUI: true;
  }
}
