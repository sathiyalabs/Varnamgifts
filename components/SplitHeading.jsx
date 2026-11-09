export default function SplitHeading({ as: Tag = "h2", text, ...props }) {
  return (
    <Tag {...props}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, index) => (
          <span key={index}>
            {index > 0 && " "}
            <span className="split-word">
              {Array.from(word).map((character, position) => (
                <span className="split-mask" key={position}>
                  <span className="split-character" data-split-character>{character}</span>
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
