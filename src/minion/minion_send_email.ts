import axios from 'axios';
import qs from 'qs';
import {
  MAIL_ALIAS,
  MAIL_API,
  MAIL_USER,
  TIMEOUT_DEFAULT,
  TOKEN_CMS,
} from 'src/stores/constanta';

export async function minionUiSendMail(
  subject: string,
  to: string,
  message: string
): Promise<boolean> {
  try {
    const data = qs.stringify({
      subject: `Booking Code ${subject}`,
      to: `${MAIL_USER},${to}`,
      message: message,
      alias: MAIL_ALIAS,
    });

    const response = await axios.post(MAIL_API, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${TOKEN_CMS}`,
        // Include the Cookie header if it's required by your server
        // 'Cookie': 'Your_Cookie_Value'
      },
      timeout: TIMEOUT_DEFAULT,
    });

    // Check response status or other properties as needed
    console.log(response.data); // You can log the response or handle it as needed

    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
}
