import pdfkit from "pdfkit";
import sizeOf from "image-size";

// A4 size 72 PPI
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

export class PDF {
  constructor(options = { margin: 10 }) {
    this._pdfkitDoc = new pdfkit();

    this._options = options;
    this._currentY = options.margin;
  }

  get pdfkitDoc() {
    return this._pdfkitDoc;
  }

  read() {
    this._pdfkitDoc.end();

    return new Promise((resolve) => {
      const buffers = [];
      this._pdfkitDoc.on("data", buffers.push.bind(buffers));

      this._pdfkitDoc.on("end", () => {
        const pdf = Buffer.concat(buffers);
        resolve(pdf);
      });
    });
  }

  async addImages(urls) {
    try {
      for (const url of urls) {
        await this.addImage(url);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async addImage(url) {
    const { margin } = this._options;
    const image = await this._fetchImage(url);

    let { width, height } = this._getScaledDimensions(image);

    if (this._currentY + height > PAGE_HEIGHT - margin) {
      this._pdfkitDoc.addPage();
      this._currentY = margin;
    }

    this._pdfkitDoc.image(image, this._options.margin, this._currentY, {
      width,
      align: "center",
      valign: "center",
    });

    this._currentY += height;
  }

  async _fetchImage(url) {
    const response = await fetch(url);
    return response.arrayBuffer();
  }

  _getScaledDimensions(
    image,
    options = {
      maxWidth: PAGE_WIDTH - this._options.margin * 2,
      maxHeight: PAGE_HEIGHT - this._options.margin * 2,
    }
  ) {
    const dimensions = sizeOf(Buffer.from(image));
    if (!dimensions || !dimensions.width || !dimensions.height) {
      throw new Error("Invalid image - unable to get dimensions.");
    }
    const { width, height } = dimensions;
    const aspectRatio = width / height;

    const { maxWidth, maxHeight } = options;
    const maxAspectRatio = maxWidth / maxHeight;

    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }

    if (aspectRatio > maxAspectRatio) {
      return {
        width: maxWidth,
        height: Math.round(maxWidth / aspectRatio),
      };
    }

    return {
      width: Math.round(maxHeight * aspectRatio),
      height: maxHeight,
    };
  }
}
