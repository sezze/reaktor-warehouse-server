import Availability from './Availability';

export default interface AvailabilityMap {
  [key: string]: AvailabilityMapEntry | undefined;
}

export interface AvailabilityMapEntry {
  [key: string]: Availability | undefined;
}
