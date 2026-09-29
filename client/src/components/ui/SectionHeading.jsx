export default function SectionHeading({ eyebrow, title, description, dark = false, center = false }) {
  return (
    <div className={`${center ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className={`mt-2 text-3xl font-bold sm:text-4xl ${dark ? 'text-blush' : 'text-ruby'}`}>{title}</h2>
      {description && (
        <p className={`mt-4 text-base leading-relaxed ${dark ? 'text-blush/80' : 'text-bordeaux'}`}>{description}</p>
      )}
    </div>
  );
}
