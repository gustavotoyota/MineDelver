export class Images {
  private readonly _images: Map<string, HTMLImageElement> = new Map();
  private readonly _imagePromises: Map<string, Promise<HTMLImageElement>> =
    new Map();

  addImage(name: string, path: string) {
    const image = new Image();
    image.src = path;

    this._images.set(name, image);

    this._imagePromises.set(
      name,
      new Promise<HTMLImageElement>((resolve) => {
        image.onload = () => {
          resolve(image);
        };
      })
    );
  }

  getImage(name: string): HTMLImageElement | undefined {
    return this._images.get(name);
  }

  allImagesLoaded() {
    return Promise.all(this._imagePromises.values());
  }
}
