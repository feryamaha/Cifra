'use client';

import { TuningMap } from '@/components/music/TuningMap';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ControlLabel } from '@/components/ui/ControlLabel';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import { Stepper } from '@/components/ui/Stepper';
import { Toggle } from '@/components/ui/Toggle';
import { TUNING_LIST } from '@/data/music/tunings.data';
import {
  CAPO_OPTIONS,
  FONT_STEP_LIMITS,
  KEY_BUTTONS,
  NOTATION_OPTIONS,
  TRANSPOSE_LIMITS,
  VIEW_TYPE_OPTIONS,
} from '@/data/song-view/song-controls.data';
import { cn } from '@/lib/utils';
import type { SongControlsProps } from '@/types/song/song-view.types';

export function SongControls({ view }: SongControlsProps) {
  return (
    <Card className="space-y-5">
      <section>
        <ControlLabel>Tom</ControlLabel>
        <div className="grid grid-cols-7 gap-1">
          {KEY_BUTTONS.map((key) => {
            const badge = view.scaleDegreeBadges.find((b) => b.note === key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => view.selectKeyRoot(key)}
                className={cn(
                  'relative cursor-pointer rounded-md border py-1.5 font-mono text-sm transition-all',
                  view.currentKeyName === key
                    ? 'border-primary-500 bg-primary-400 font-bold text-secondary-950'
                    : 'border-stroke-200 bg-secondary-800 text-neutral-700 hover:border-primary-700',
                )}
              >
                {key}
                {badge && (
                  <Badge
                    variant="number"
                    className="absolute -top-2.5 -right-1.5 min-w-[18px] text-[9px]"
                  >
                    {badge.degree}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-neutral-500">Semitons</span>
          <Stepper
            value={view.transpose}
            onChange={view.setTranspose}
            min={TRANSPOSE_LIMITS.min}
            max={TRANSPOSE_LIMITS.max}
            label="transposição"
            format={(v) => (v > 0 ? `+${v}` : `${v}`)}
          />
        </div>
      </section>

      <section>
        <ControlLabel>Capotraste</ControlLabel>
        <div className="grid grid-cols-5 gap-1 @tablet:grid-cols-9">
          {CAPO_OPTIONS.map((fret) => (
            <button
              key={fret}
              type="button"
              onClick={() => view.setCapo(fret)}
              className={cn(
                'cursor-pointer rounded-md border py-1.5 font-mono text-sm',
                view.capo === fret
                  ? 'border-primary-500 bg-primary-400 font-bold text-secondary-950'
                  : 'border-stroke-200 bg-secondary-800 text-neutral-700',
              )}
            >
              {fret === 0 ? 'Ø' : fret}
            </button>
          ))}
        </div>
        {view.capo > 0 && (
          <p className="mt-2 text-xs text-neutral-500">
            Soa em {view.currentKeyName}. Shapes de {view.shapeKeyName}.
          </p>
        )}
      </section>

      <section>
        <ControlLabel>Visualização / notação</ControlLabel>
        <SegmentedControl
          value={view.notation}
          onChange={view.setNotation}
          size="sm"
          options={NOTATION_OPTIONS}
        />
      </section>

      <section className="flex items-center justify-between">
        <ControlLabel className="mb-0">Cifra simplificada</ControlLabel>
        <Toggle checked={view.simplified} onChange={view.setSimplified} label="Simplificada" />
      </section>

      <section className="flex items-center justify-between">
        <ControlLabel className="mb-0">2 colunas (A4)</ControlLabel>
        <Toggle checked={view.twoColumns} onChange={view.setTwoColumns} label="2 colunas" />
      </section>

      <section className="flex items-center justify-between">
        <ControlLabel className="mb-0">Diagramas no corpo</ControlLabel>
        <Toggle
          checked={view.inlineDiagrams}
          onChange={view.setInlineDiagrams}
          label="Diagramas inline"
        />
      </section>

      <section className="flex items-center justify-between">
        <ControlLabel className="mb-0">Canhoto (espelhar)</ControlLabel>
        <Toggle checked={view.lefty} onChange={view.setLefty} label="Canhoto" />
      </section>

      <section>
        <ControlLabel>Afinação</ControlLabel>
        <Select
          value={view.tuningId}
          onChange={view.setTuningId}
          label="Afinação"
          options={TUNING_LIST.map((t) => ({ value: t.id, label: t.label }))}
        />
        <div className="mt-3">
          <TuningMap tuning={view.tuning} />
        </div>
      </section>

      <section>
        <ControlLabel>Tipo de cifra</ControlLabel>
        <SegmentedControl
          value={view.viewType}
          onChange={view.setViewType}
          size="sm"
          options={VIEW_TYPE_OPTIONS}
        />
      </section>

      <section className="flex items-center justify-between">
        <ControlLabel className="mb-0">Tamanho do texto</ControlLabel>
        <Stepper
          value={view.fontStep}
          onChange={view.setFontStep}
          min={FONT_STEP_LIMITS.min}
          max={FONT_STEP_LIMITS.max}
          label="tamanho"
          format={(v) => `${v * 10}%`}
        />
      </section>
    </Card>
  );
}
