import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAvancarFase } from '@modules/ciclo';
import type { AvancarFaseDto } from '@shared/dto';

interface Props {
  cicloId: string;
  faseAtual: string;
  faseNumero: number;
  onSuccess?: () => void;
}

/**
 * Feature: Avançar fase do ciclo MASP.
 * Usa retry semântico automático em caso de HTTP 409.
 */
export function AvancarFaseForm({ cicloId, faseAtual, faseNumero, onSuccess }: Props) {
  const { register, handleSubmit, reset } = useForm<AvancarFaseDto>();
  const { mutate, isPending, isError, error } = useAvancarFase(cicloId);
  const [sucesso, setSucesso] = useState(false);

  const onSubmit = (data: AvancarFaseDto) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        setSucesso(true);
        setTimeout(() => setSucesso(false), 2000);
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Fase atual: <span style={{ color: 'var(--vale-teal-light)', fontWeight: 600 }}>{faseAtual}</span> ({faseNumero}/8)
      </p>

      <div className="field">
        <label className="label">Observação</label>
        <textarea
          className="textarea"
          {...register('observacao')}
          rows={3}
          placeholder="Justificativa para avançar fase..."
        />
      </div>

      <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%' }}>
        {isPending ? 'Processando...' : 'Avançar Fase →'}
      </button>

      {sucesso && (
        <div className="toast toast-success">Fase avançada com sucesso!</div>
      )}

      {isError && (
        <p className="field-error" style={{ marginTop: '0.5rem' }}>
          {(error as Error)?.message ?? 'Erro ao avançar fase'}
        </p>
      )}
    </form>
  );
}
