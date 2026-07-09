'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ChordDiagram } from '@/components/ui/ChordDiagram';
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
                  'relative cursor-pointer rounded-md border py-1.5 font-mono text-sm transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-primary-400',
                  view.currentKeyName === key
                    ? 'border-primary-500 bg-primary-400 font-bold text-secondary-950'
                    : view.currentKeyName[0] === key
                      ? 'border-primary-700 bg-secondary-800 text-primary-300'
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
        <div className="grid grid-cols-8 gap-1">
          {CAPO_OPTIONS.map((fret) => (
            <button
              key={fret}
              type="button"
              onClick={() => view.setCapo(fret)}
              className={cn(
                'cursor-pointer rounded-md border py-1.5 font-mono text-sm transition-colors',
                'focus-visible:outline-2 focus-visible:outline-primary-400',
                view.capo === fret
                  ? 'border-primary-500 bg-primary-400 font-bold text-secondary-950'
                  : 'border-stroke-200 bg-secondary-800 text-neutral-700 hover:border-primary-700',
              )}
            >
              {fret === 0 ? 'Ø' : fret}
            </button>
          ))}
        </div>
        {view.capo > 0 && (
          <p className="mt-2 text-xs text-neutral-500">
            A música continua soando em {view.currentKeyName}. Toque os shapes de{' '}
            {view.shapeKeyName}.
          </p>
        )}
      </section>

      <section>
        <ControlLabel>Visualização</ControlLabel>
        <SegmentedControl
          value={view.notation}
          onChange={view.setNotation}
          size="sm"
          options={NOTATION_OPTIONS}
        />
      </section>

      <section className="flex items-center justify-between">
        <ControlLabel className="mb-0">Cifra simplificada</ControlLabel>
        <Toggle
          checked={view.simplified}
          onChange={view.setSimplified}
          label="Cifra simplificada"
        />
      </section>

      <section>
        <ControlLabel>Afinação</ControlLabel>
        <Select
          value={view.tuningId}
          onChange={view.setTuningId}
          label="Afinação"
          options={TUNING_LIST.map((t) => ({ value: t.id, label: t.label }))}
        />
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
          label="tamanho do texto"
          format={(v) => `${v * 10}%`}
        />
      </section>

      {/* diagrama do acorde clicado */}
      <section className="border-t border-stroke-100 pt-4">
        <ControlLabel>Shape na afinação atual</ControlLabel>
        {view.selectedVoicing ? (
          <div className="flex justify-center">
            <ChordDiagram
              voicing={view.selectedVoicing.voicing}
              tuning={view.tuning}
              label={view.selectedVoicing.label}
            />
          </div>
        ) : (
          <p className="text-xs text-neutral-500">
            Toque em qualquer acorde da cifra para ver o desenho calculado para a afinação
            selecionada.
          </p>
        )}
      </section>
    </Card>
  );
}
