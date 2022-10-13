/**
 * Juxtapose.
 */
import './juxtapose.css';

interface JXSliderImage {
  src: string;
  alt?: string;
  label?: string;
  credit?: string;
}

interface JXSliderOptions {
  animate?: boolean;
  showLabels?: boolean;
  showCredits?: boolean;
  makeResponsive?: boolean;
  startingPosition: string;
  mode: 'horizontal' | 'vertical';
  callback?: Function | null;
}

interface Dimension {
  width: number;
  height: number;
  ratio?: number;
}

interface ImageDimension extends Dimension {
  aspect: Function;
}

export class Graphic {
  image: HTMLImageElement = new Image();
  loaded: boolean = false;
  label: string | false;
  credit: string | false;

  constructor(properties: JXSliderImage, slider: JXSlider) {
    this.image.onload = () => {
      this.loaded = true;
      slider.onLoaded();
    };
    this.image.src = properties.src;
    this.image.alt = properties.alt || '';
    this.label = properties.label || false;
    this.credit = properties.credit || false;
  }
}

export class JXSlider {
  selector!: HTMLElement;
  options: JXSliderOptions = {
    animate: true,
    showLabels: true,
    showCredits: true,
    makeResponsive: true,
    startingPosition: '50%',
    mode: 'horizontal',
    callback: null,
  };
  imgBefore!: Graphic;
  imgAfter!: Graphic;
  slider!: HTMLDivElement;
  handle!: HTMLDivElement;
  rightImage!: HTMLDivElement;
  leftImage!: HTMLDivElement;
  sliderPosition!: string;
  leftArrow!: HTMLDivElement;
  rightArrow!: HTMLDivElement;
  control!: HTMLDivElement;
  controller!: HTMLDivElement;
  labCredit!: HTMLAnchorElement;
  labLogo!: HTMLDivElement;
  projectName!: HTMLSpanElement;

  constructor(
    selector: HTMLElement,
    images: JXSliderImage[],
    options?: JXSliderOptions
  ) {
    this.selector = selector;
    if (options) {
      this.options = { ...this.options, ...options };
    }

    if (images.length === 2) {
      this.imgBefore = new Graphic(images[0], this);
      this.imgAfter = new Graphic(images[1], this);
    } else {
      console.warn(`The images parameter takes two Image objects.`);
    }

    if (this.imgBefore.credit || this.imgAfter.credit) {
      this.options.showCredits = true;
    } else {
      this.options.showCredits = false;
    }
  }

  updateSlider = (input: number | string | MouseEvent, animate: boolean) => {
    let leftPercent: string | number,
      leftPercentNum: number,
      rightPercent: string | number;
    if (this.options.mode === 'vertical') {
      leftPercent = getTopPercent(this.slider, input);
    } else {
      leftPercent = getLeftPercent(this.slider, input);
    }

    leftPercent = leftPercent.toFixed(2) + '%';
    leftPercentNum = parseFloat(leftPercent);
    rightPercent = 100 - leftPercentNum + '%';

    if (leftPercentNum > 0 && leftPercentNum < 100) {
      removeClass(this.handle, 'transition');
      removeClass(this.rightImage, 'transition');
      removeClass(this.leftImage, 'transition');

      if (this.options.animate && animate) {
        addClass(this.handle, 'transition');
        addClass(this.leftImage, 'transition');
        addClass(this.rightImage, 'transition');
      }

      if (this.options.mode === 'vertical') {
        this.handle.style.top = leftPercent;
        this.leftImage.style.height = leftPercent;
        this.rightImage.style.height = rightPercent;
      } else {
        this.handle.style.left = leftPercent;
        this.leftImage.style.width = leftPercent;
        this.rightImage.style.width = rightPercent;
      }
      this.sliderPosition = leftPercent;
    }
  };

  calculateDims = (width: number, height: number): Dimension => {
    const ratio: number = getImageDimensions(this.imgBefore.image).aspect();
    if (width) {
      height = width / ratio;
    } else if (height) {
      width = height * ratio;
    }
    return {
      width,
      height,
      ratio,
    };
  };

  setWrapperDimensions = () => {
    const wrapperWidth = getComputedWidthAndHeight(this.selector).width;
    const wrapperHeight = getComputedWidthAndHeight(this.selector).height;
    const dims = this.calculateDims(wrapperWidth, wrapperHeight);
    this.selector.style.height = `${dims.height}px`;
    this.selector.style.width = `${dims.width}px`;
  };

  checkImages = () => {
    if (
      getImageDimensions(this.imgBefore.image).aspect() ===
      getImageDimensions(this.imgAfter.image).aspect()
    ) {
      return true;
    }
    return false;
  };

  displayLabel = (element: HTMLDivElement, labelText: string) => {
    const label: HTMLDivElement = document.createElement('div');
    label.className = 'jx-label';
    label.setAttribute('tabindex', '0');
    setText(label, labelText);
    element.appendChild(label);
  };

  displayCredits = () => {
    const credit: HTMLDivElement = document.createElement('div');
    credit.className = 'jx-credit';
    let text = '<em>Photo Credits:</em>';
    if (this.imgBefore.credit) {
      text += ` <em>Before</em> ${this.imgBefore.credit}`;
    }
    if (this.imgAfter.credit) {
      text += ` <em>After</em> ${this.imgAfter.credit}`;
    }
    credit.innerHTML = text;
    this.selector.appendChild(credit);
  };

  readonly onLoaded = () => {
    if (
      this.imgBefore &&
      this.imgBefore.loaded === true &&
      this.imgAfter &&
      this.imgAfter.loaded === true
    ) {
      addClass(this.selector, 'juxtapose');
      this.setWrapperDimensions();

      this.slider = document.createElement('div');
      this.slider.className = 'jx-slider';
      this.selector.appendChild(this.slider);

      if (this.options.mode !== 'horizontal') {
        addClass(this.slider, this.options.mode);
      }

      this.handle = document.createElement('div');
      this.handle.className = 'jx-handle';

      this.rightImage = document.createElement('div');
      this.rightImage.className = 'jx-image jx-right';
      this.rightImage.appendChild(this.imgAfter.image);

      this.leftImage = document.createElement('div');
      this.leftImage.className = 'jx-image jx-left';
      this.leftImage.appendChild(this.imgBefore.image);

      this.labCredit = document.createElement('a');
      this.labCredit.setAttribute('href', 'https://www.idcos.com');
      this.labCredit.setAttribute('target', '_blank');
      this.labCredit.setAttribute('rel', 'noopener');
      this.labCredit.className = 'jx-knightlab';
      this.labLogo = document.createElement('div');
      this.labLogo.className = 'knightlab-logo';
      this.labCredit.append(this.labLogo);
      this.projectName = document.createElement('span');
      this.projectName.className = 'juxtapose-name';
      setText(this.projectName, 'JuxtaposeJS');
      this.labCredit.appendChild(this.projectName);

      this.slider.appendChild(this.handle);
      this.slider.appendChild(this.leftImage);
      this.slider.appendChild(this.rightImage);
      this.slider.appendChild(this.labCredit);

      this.leftArrow = document.createElement('div');
      this.rightArrow = document.createElement('div');
      this.control = document.createElement('div');
      this.controller = document.createElement('div');

      this.leftArrow.className = 'jx-arrow jx-left';
      this.rightArrow.className = 'jx-arrow jx-right';
      this.control.className = 'jx-control';
      this.controller.className = 'jx-controller';

      this.controller.setAttribute('tabindex', '0');
      this.controller.setAttribute('role', 'slider');
      this.controller.setAttribute('aria-valuenow', '50');
      this.controller.setAttribute('aria-valuemin', '0');
      this.controller.setAttribute('aria-valuemax', '100');

      this.handle.appendChild(this.leftArrow);
      this.handle.appendChild(this.control);
      this.handle.appendChild(this.rightArrow);
      this.control.appendChild(this.controller);

      this.init();
    }
  };

  readonly init = () => {
    if (this.checkImages() === false) {
      console.warn(
        this,
        'Check that the two images have the same aspect ratio for the slider to work correctly.'
      );
    }

    this.updateSlider(this.options.startingPosition, false);

    if (this.options.showLabels === true) {
      if (this.imgBefore.label) {
        this.displayLabel(this.leftImage, this.imgBefore.label);
      }
      if (this.imgAfter.label) {
        this.displayLabel(this.rightImage, this.imgAfter.label);
      }
    }

    if (this.options.showCredits === true) {
      this.displayCredits();
    }

    const self = this;

    window.addEventListener('resize', function () {
      self.setWrapperDimensions();
    });

    this.slider.addEventListener('mousedown', function (e) {
      e.preventDefault();
      self.updateSlider(e, true);
      let animate = true;

      this.addEventListener('mousemove', function (e) {
        e.preventDefault();
        if (animate) {
          self.updateSlider(e, false);
        }
      });

      this.addEventListener('mouseup', function (e) {
        e.preventDefault();
        e.stopPropagation();
        animate = false;
      });
    });

    if (this.options.callback && typeof this.options.callback === 'function') {
      this.options.callback(this);
    }
  };
}

// ============= Utils ==============
// Add class to element.
function addClass(element: HTMLElement, c: string) {
  if (element.classList) {
    element.classList.add(c);
  } else {
    element.className += ` ${c}`;
  }
}

// Remove class from element's classList.
function removeClass(element: HTMLElement, c: string) {
  element.className = element.className
    .replace(/(\S+)\s*/g, function (w, match) {
      if (match === c) {
        return '';
      }
      return w;
    })
    .replace(/^\s+/, '');
}

function getNaturalDimensions(DOMelement: HTMLImageElement): Dimension {
  if (DOMelement.naturalWidth && DOMelement.naturalHeight) {
    return {
      width: DOMelement.naturalWidth,
      height: DOMelement.naturalHeight,
    };
  }
  const img = new Image();
  img.src = DOMelement.src;
  return {
    width: img.width,
    height: img.height,
  };
}

function getComputedWidthAndHeight(element: HTMLElement): Dimension {
  if ((window as any).hasOwnProperty('getComputedStyle')) {
    return {
      width: parseInt(getComputedStyle(element).width, 10),
      height: parseInt(getComputedStyle(element).height, 10),
    };
  }
  let w: number, h: number;
  w =
    element.getBoundingClientRect().right -
    element.getBoundingClientRect().left;
  h =
    element.getBoundingClientRect().bottom -
    element.getBoundingClientRect().top;
  return {
    width: w || 0,
    height: h || 0,
  };
}

function getImageDimensions(img: HTMLImageElement): ImageDimension {
  const dimensions: ImageDimension = {
    width: getNaturalDimensions(img).width,
    height: getNaturalDimensions(img).height,
    aspect: function () {
      {
        return this.width / this.height;
      }
    },
  };
  return dimensions;
}

function getLeftPercent(
  slider: HTMLDivElement,
  input: number | string | MouseEvent
): number {
  let leftPercent: number;
  if (typeof input === 'string') {
    leftPercent = parseInt(input, 10);
  } else if (typeof input === 'number') {
    leftPercent = input;
  } else {
    const sliderRect = slider.getBoundingClientRect();
    const offset = {
      top:
        sliderRect.top +
        document.body.scrollTop +
        document.documentElement.scrollTop,
      left:
        sliderRect.left +
        document.body.scrollLeft +
        document.documentElement.scrollLeft,
    };
    const width = slider.offsetWidth;
    const pageX = getPageX(input);
    const relativeX = pageX - offset.left;
    leftPercent = (relativeX / width) * 100;
  }
  return leftPercent;
}

function getTopPercent(
  slider: HTMLDivElement,
  input: number | string | MouseEvent
): number {
  let topPercent: number;
  if (typeof input === 'string') {
    topPercent = parseInt(input, 10);
  } else if (typeof input === 'number') {
    topPercent = input;
  } else {
    const sliderRect = slider.getBoundingClientRect();
    const offset = {
      top:
        sliderRect.top +
        document.body.scrollTop +
        document.documentElement.scrollTop,
      left:
        sliderRect.left +
        document.body.scrollLeft +
        document.documentElement.scrollLeft,
    };
    const width = slider.offsetHeight;
    const pageY = getPageY(input);
    const relativeY = pageY - offset.top;
    topPercent = (relativeY / width) * 100;
  }
  return topPercent;
}

function getPageX(e: MouseEvent): number {
  let pageX: number;
  if (e.pageX) {
    pageX = e.pageX;
  } else {
    pageX =
      e.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft;
  }
  return pageX;
}

function getPageY(e: MouseEvent): number {
  let pageY: number;
  if (e.pageY) {
    pageY = e.pageY;
  } else {
    pageY =
      e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  return pageY;
}

function setText(element: HTMLElement, text: string) {
  if (document.body.textContent) {
    element.textContent = text;
  } else {
    element.innerText = text;
  }
}
