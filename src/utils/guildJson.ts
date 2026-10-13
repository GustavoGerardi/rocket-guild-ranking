export function validateGuildJson(data: unknown): string | null {
  if (!data || typeof data !== 'object')
    return 'O arquivo não contém um objeto JSON válido.';
  const members = (data as { members?: unknown }).members;
  if (!Array.isArray(members))
    return 'O JSON precisa conter o campo "members" como uma lista.';
  if (!members.length) return 'A lista "members" está vazia.';

  // Check the same fields and coercions as before; extra JSON fields are preserved.
  const invalid = members.find((value: unknown) => {
    const member = value as Record<string, unknown>;
    return (
      typeof member.name !== 'string' ||
      Number.isNaN(Number(member.dailiesCompleted)) ||
      Number.isNaN(Number(member.contribution))
    );
  }) as Record<string, unknown> | undefined;

  if (invalid) {
    return `O jogador ${invalid.name || '(sem nome)'} está sem name, dailiesCompleted ou contribution válido.`;
  }

  return null;
}
