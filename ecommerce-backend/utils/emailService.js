// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  service: 'Gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Order confirmation email
const sendOrderConfirmation = async (order, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Confirmation - #${order._id}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Your order has been confirmed and is being processed.</p>
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Estimated Delivery:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> $${order.totalPrice.toFixed(2)}</p>
        <h3>Shipping Address:</h3>
        <p>${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}</p>
        <br/>
        <p>If you have any questions, please contact our support team.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Order cancellation email
const sendOrderCancellation = async (order, user, reason) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Cancelled - #${order._id}`,
      html: `
        <h2>Your order has been cancelled</h2>
        <p>Order #${order._id} has been cancelled${reason ? ` for the following reason: ${reason}` : ''}.</p>
        <p>If this was a mistake or you have any questions, please contact our support team.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendOrderCancellation,
};