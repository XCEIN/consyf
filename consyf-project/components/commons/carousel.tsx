import {
  Carousel as CarouselShadcn,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselPropsExport,
} from "@/components/ui/carousel";

import React from "react";

function Carousel(props: CarouselPropsExport) {
  return <CarouselShadcn {...props} />;
}
Carousel.Content = CarouselContent
Carousel.Item = CarouselItem
Carousel.Next = CarouselNext
Carousel.Previous = CarouselPrevious

export default Carousel