import { Trophy } from 'lucide-react';

export function RankingEmptyState() {
  return (
    <section className="grid min-h-[440px] content-center place-items-center rounded-[28px] border border-dashed border-border bg-secondary p-10 text-center [&_h2]:mt-[18px] [&_h2]:mb-2 [&_h2]:text-[28px] [&_h2]:font-bold [&_p]:max-w-[640px] [&_p]:text-muted-foreground [&_p]:leading-[1.6] [&_code]:rounded-[5px] [&_code]:bg-card [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-secondary-foreground section-container">
      <div className="grid size-[84px] place-items-center rounded-[30px] border border-primary/50 bg-primary/10 text-primary-hover">
        <Trophy size={45} />
      </div>
      <h2>Seu ranking começa com um JSON</h2>
      <p>
        O arquivo precisa ter uma lista <code>members</code> com, pelo menos,{' '}
        <code>name</code>, <code>dailiesCompleted</code> e{' '}
        <code>contribution</code>.
      </p>
    </section>
  );
}
