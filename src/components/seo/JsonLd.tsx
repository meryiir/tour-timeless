import { Helmet } from "react-helmet-async";

type JsonValue = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonValue | JsonValue[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <Helmet key={i}>
          <script type="application/ld+json">{JSON.stringify(item)}</script>
        </Helmet>
      ))}
    </>
  );
}
