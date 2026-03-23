export type AfasEmployee = {
  EmId: string;
  CdNr: string;
  VoNm: string;
  AcNm: string;
  InDt: string;
  UtDt: string | null;
  FuNm: string;
};

export type AfasRoster = {
  EmId: string;
  DgNr: number;
  BgTd: string;
  EdTd: string;
  WkDg: boolean;
  InDt: string;
};

export type AfasLeave = {
  EmId: string;
  VlSrt: string;
  BgDt: string;
  EdDt: string;
  Sts: string;
};

export type AfasAbsence = {
  EmId: string;
  BgDt: string;
  EdDt: string;
  VzSrt: string;
};

export type AfasConnectorResponse<T> = {
  rows: T[];
};
