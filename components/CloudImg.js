import { getImageProps } from '../lib/site-data.js';

export default function CloudImg({
  imgKey,
  eager = false,
  sizes = '(max-width: 900px) 100vw, 50vw',
  defaultWidth = 1440,
  decorative = false,
  altOverride,
  className,
  style,
  layered = false,
}) {
  const props = getImageProps(imgKey, { eager, sizes, defaultWidth, decorative });
  const altText = decorative ? '' : altOverride !== undefined ? altOverride : props.alt;

  const imgEl = (
    <img
      src={props.src}
      srcSet={props.srcSet}
      sizes={props.sizes}
      width={props.width}
      height={props.height}
      alt={altText}
      loading={props.loading}
      fetchPriority={props.fetchPriority}
      decoding={props.decoding}
      aria-hidden={decorative ? 'true' : undefined}
      className={className}
      style={style}
    />
  );

  if (!layered) return imgEl;

  return (
    <span className="par">
      <span className="rev">{imgEl}</span>
    </span>
  );
}
