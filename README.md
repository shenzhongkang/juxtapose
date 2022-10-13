# JuxtaposeJS

There is a TypeScript version of JuxtaposeJS.

JuxtaposeJS is a JavaScript library for making before/after image sliders.

![example](https://github.com/shenzhongkang/juxtapose/blob/main/juxtapose-gif.gif?raw=true)

## Thanks

JS version repository: https://github.com/NUKnightLab/juxtapose

## Usage

```ts
import React, { useRef, useState, useEffect } from 'react';
import { JXSlider } from './juxtapose';
import './juxtapose.css';

import FirstImg from './images/first.jpg';
import SecondImg from './images/second.jpg';

export const Comp = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [slider, setSlider] = useState<JXSlider>();

  useEffect(() => {
    if (!slider) {
      init();
    }
  }, []);

  const init = () => {
    const s = new JXSlider(ref.current as HTMLDivElement, [
      { src: FirstImg },
      { src: SecondImg },
    ]);
    setSlider(s);
  };

  return <div ref={ref} />;
};
```
