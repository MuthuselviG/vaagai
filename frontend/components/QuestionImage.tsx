type Props = {
  src: string | null | undefined;
  alt?: string;
};

export default function QuestionImage({ src, alt = "" }: Props) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      style={{
        display: "block",
        maxWidth: "100%",
        height: "auto",
        borderRadius: 10,
        margin: "10px 0",
        border: "1px solid #EEE",
      }}
    />
  );
}
