const escpos = require('escpos');
escpos.Network = require('escpos-network');
const { formatTimestamp } = require('./firebaseDateFormatter');

async function testPrinter(deviceId) {
  const device = new escpos.Network(deviceId);
  // const options = { encoding: 'GB18030' /* default */ };
  const printer = new escpos.Printer(device);

  device.open((error) => {
    console.log('Device Open');
    if (error) {
      console.error('Error in opening device:', error);
      return;
    }

    printer
      // TODO: Update
      .getStatus('PrinterStatus', (status) => {
        console.log(status.toJSON());
      })
      .close();

    printer
      .getStatuses((statuses) => {
        statuses.forEach((status) => {
          console.log(status.toJSON());
        });
      })
      .close();

    console.log('End Of Test');

    printer
      .font('C')
      .align('CT')
      .size(1, 1)
      .text('The quick brown fox jumps over the lazy dog')
      .table(['One', 'Two', 'Three'])
      .tableCustom({ text: 'Left', align: 'LEFT', width: 0.33 })
      .cut()
      .close();
  });
}

function printOrder(deviceId, order) {
  const device = new escpos.Network(deviceId);
  const printer = new escpos.Printer(device);

  device.open((error) => {
    if (error) {
      console.error('Error in opening device:', error);
      return;
    }

    // Start printing
    printer
      .font('B')
      .align('CT')
      .style('NORMALs')
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
      .text('')
      .text('Tambahan:');

    order.itemSummary?.items.forEach((item) => {
      printer.text(
        item.name + ' x ' + item.quantity + ' @ Rp. ' + item.price + ''
      );
    });

    printer
      .text('')
      .text('Items Total Price: ' + (order.itemsTotalPrice || 'N/A'))
      .text('Room Total Price: ' + (order.roomTotalPrice || 'N/A'))
      .text('Grand Total Price: ' + (order.grandTotalPrice || 'N/A'))
      .align('CT')
      .text('Thank You For Your Visit')
      .text('')
      .cut()
      .close();
  });
}

module.exports = { testPrinter, printOrder };
