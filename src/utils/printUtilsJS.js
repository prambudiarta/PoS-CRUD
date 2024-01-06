const escpos = require('escpos');
escpos.Network = require('escpos-network');
const { formatTimestamp } = require('./firebaseDateFormatter');

function testPrinter(deviceId) {
  console.log('JS');
  console.log(deviceId);
  const device = new escpos.Network('deviceId');
  const options = { encoding: 'GB18030' /* default */ };
  const printer = new escpos.Printer(device, options);

  device.open((error) => {
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

function printOrder(deviceId, order) {
  console.log('printOrder');
  console.log(deviceId);
  console.log(order);

  const device = new escpos.Network(deviceId);
  const options = { encoding: 'GB18030' };
  const printer = new escpos.Printer(device, options);

  device.open((error) => {
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
      .text('Customer ID: ' + (order.customerId || 'N/A'))
      .text('Device ID: ' + order.deviceId)
      .text('Order Status: ' + order.status)
      .text('Start Time: ' + formatTimestamp(order.startTime))
      .text(
        'End Time: ' + (order.endTime ? formatTimestamp(order.endTime) : 'N/A')
      )
      .text('Duration: ' + (order.durationHours || 'N/A') + ' hours')
      .text('Items:');

    order.itemSummary?.items.forEach((item) => {
      printer.text(
        item.name + ' x ' + item.quantity + ' @ ' + item.price + ' each'
      );
    });

    printer
      .text('Items Total Price: ' + (order.itemsTotalPrice || 'N/A'))
      .text('Room Total Price: ' + (order.roomTotalPrice || 'N/A'))
      .text('Grand Total Price: ' + (order.grandTotalPrice || 'N/A'))
      .cut()
      .close();
  });
}

module.exports = { testPrinter, printOrder };
