export interface LegacyAvailabilityResponse {
  code: number;
  response: LegacyAvailability[] | string;
}

export default interface LegacyAvailability {
  id: string;
  DATAPAYLOAD: string;
}
