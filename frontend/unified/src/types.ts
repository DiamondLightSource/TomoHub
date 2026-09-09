export enum Technique {
  Dpc = "Dpc",
  Nbed = "Nbed",
  Ptycho = "Ptycho",
  Tomo = "Tomo",
  Xanes = "Xanes",
  Xrd = "Xrd",
}

export enum Beamline {
  DIAD,
  "I08-1",
  I12,
  "I13-1",
  "I13-2",
  I14,
  Epsic,
}

export type Option = { label: string; value: string; desc?: string };

export type TemplateComponentProps = {
  setParameters: (_: object) => void;
};
