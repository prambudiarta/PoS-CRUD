import { Order } from './interfaces';

interface Window {
  electronAPI: {
    sendPrintTest: (printerId: string) => void;
    sendPrintOrder: (printerId: string, order: Order) => void;
  };
}
