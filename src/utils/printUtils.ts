import { Network, Printer } from 'escpos';
import { Order } from 'src/types/interfaces';
import { formatTimestamp } from './firebaseDateFormatter';

export function testPrinter(deviceId: string) {
  // For Network or Serial, uncomment the necessary line
  console.log(deviceId);
  const device = new Network(deviceId);
  // const device = new escpos.Serial('/dev/usb/lp0');

  const options = { encoding: 'GB18030' /* default */ };

  const printer = new Printer(device, options);

  device.open((error: Error) => {
    if (error) {
      console.error('Error in opening device:', error);
      return;
    }

    printer
      .font('A')
      .align('CT')
      .style('BU')
      .size(1, 1)
      .text('The quick brown fox jumps over the lazy dog')
      .text('敏捷的棕色狐狸跳过懒狗')
      .barcode('1234567', 'EAN8')
      .table(['One', 'Two', 'Three'])
      .tableCustom({ text: 'Left', align: 'LEFT', width: 0.33 });
  });
}

export function printOrder(deviceId: string, order: Order) {
  const device = new Network(deviceId);
  const options = { encoding: 'GB18030' };

  const printer = new Printer(device, options);

  device.open((error: Error) => {
    if (error) {
      console.error('Error in opening device:', error);
      return;
    }

    // Start printing
    printer
      .font('A')
      .align('CT')
      .style('BU')
      .size(1, 1)
      .text('Order Receipt')
      .align('LT')
      .text('Order ID: ' + order.orderId)
      .text('Customer ID: ' + (order.customerId ?? 'N/A'))
      .text('Device ID: ' + order.deviceId)
      .text('Order Status: ' + order.status)
      .text('Start Time: ' + formatTimestamp(order.startTime))
      .text(
        'End Time: ' + (order.endTime ? formatTimestamp(order.endTime) : 'N/A')
      )
      .text('Duration: ' + (order.durationHours ?? 'N/A') + ' hours')
      .text('Items:');

    // Print each item
    order.itemSummary?.items.forEach((item) => {
      printer.text(
        item.name + ' x ' + item.quantity + ' @ ' + item.price + ' each'
      );
    });

    // Print totals
    printer
      .text('Items Total Price: ' + (order.itemsTotalPrice ?? 'N/A'))
      .text('Room Total Price: ' + (order.roomTotalPrice ?? 'N/A'))
      .text('Grand Total Price: ' + (order.grandTotalPrice ?? 'N/A'))
      .cut()
      .close();
  });
}

export default printOrder;
