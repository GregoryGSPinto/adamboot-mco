import { useForm } from 'react-hook-form';
import { useCriarEvento } from '@modules/evento';
import type { CriarEventoDto } from '@shared/dto';

interface Props {
  onSuccess?: () => void;
}

/**
 * Feature: form compacto de registro de evento.
 * Para uso embedded (ex: dentro de modal ou sidebar).
 * Componente de formulário reutilizável.
 */
export function RegistrarEventoForm({ onSuccess }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CriarEventoDto>();
  const { mutate, isPending, isError, error } = useCriarEvento();

  const onSubmit = (data: CriarEventoDto) => {
    mutate({ ...data, data: new Date().toISOString() }, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label className="label">Local</label>
        <input
          className="input"
          {...register('local', { required: 'Local obrigatório' })}
          placeholder="Ex: Pátio Norte — Linha 3"
        />
        {errors.local && <span className="field-error">{errors.local.message}</span>}
      </div>

      <div className="field">
        <label className="label">Descrição</label>
        <textarea
          className="textarea"
          {...register('descricao', { required: 'Descrição obrigatória', minLength: { value: 10, message: 'Mínimo 10 caracteres' } })}
          rows={3}
          placeholder="O que aconteceu..."
        />
        {errors.descricao && <span className="field-error">{errors.descricao.message}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="field">
          <label className="label">Tipo</label>
          <select className="select" {...register('tipo', { required: true })}>
            <option value="INCIDENTE">Incidente</option>
            <option value="QUASE_ACIDENTE">Quase-Acidente</option>
            <option value="DESVIO">Desvio</option>
            <option value="OBSERVACAO">Observação</option>
            <option value="AUDITORIA">Auditoria</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Severidade</label>
          <select className="select" {...register('severidade', { required: true })}>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%' }}>
        {isPending ? 'Registrando...' : 'Registrar'}
      </button>

      {isError && (
        <p className="field-error" style={{ marginTop: '0.5rem' }}>
          {(error as Error)?.message ?? 'Erro ao registrar'}
        </p>
      )}
    </form>
  );
}
