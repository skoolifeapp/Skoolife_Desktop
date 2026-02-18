export function FicheResult({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">{data.title}</p>

      <div>
        <p className="text-xs font-medium text-primary mb-1">📌 Points clés</p>
        <ul className="space-y-1">
          {data.key_points?.map((pt: string, i: number) => (
            <li key={i} className="text-xs flex items-start gap-1.5">
              <span className="text-primary mt-0.5">•</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      {data.definitions?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-primary mb-1">📖 Définitions</p>
          <div className="space-y-1.5">
            {data.definitions.map((d: any, i: number) => (
              <div key={i}>
                <p className="text-xs font-medium">{d.term}</p>
                <p className="text-xs text-muted-foreground">{d.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-primary mb-1">📝 Résumé</p>
        <p className="text-xs">{data.summary}</p>
      </div>
    </div>
  );
}
