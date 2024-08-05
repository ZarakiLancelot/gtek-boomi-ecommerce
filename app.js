const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const { setTimeout } = require('timers/promises');

const app = express();
const port = process.env.PORT || 3000;
const API_USER = 'DummyUser@blueorangeintegrationtech-AD9F0T.924DQX';
const API_TOKEN = '5ff64d54-478f-4ea3-b7f0-a8853362d45d';
const PAGE_SIZE = 10;

app.use(cors());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static("public/"));
app.use(express.urlencoded({ extended: true }));

function formatDateTime(datetimeString) {
    if(!datetimeString) return '';
    const year = datetimeString.substring(0, 4);
    const month = datetimeString.substring(4, 6);
    const day = datetimeString.substring(6, 8);
    const hours = datetimeString.substring(9, 11);
    const minutes = datetimeString.substring(11, 13);
    const seconds = datetimeString.substring(13, 15);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

app.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        
        const response = await axios.get('https://c02-usa-east.integrate-test.boomi.com/ws/rest/ecommerce/v1/order/', {
            auth: {
                username: API_USER,
                password: API_TOKEN,
            },
        });
        
        const rawOrderList = response.data.flat();
        const orderList = rawOrderList.map(order => {
            return {
                ...order,
                createadAt: order.createadAt ? formatDateTime(order.createadAt) : '',
                receivedByWarehouseAt: order.receivedByWarehouseAt ? formatDateTime(order.receivedByWarehouseAt) : '',
                sentByWarehouseAt: order.sentByWarehouseAt ? formatDateTime(order.sentByWarehouseAt) : ''
            };
        });
        // const orderList = response.data;
        console.log('Order List:', orderList);

        const totalPages = Math.ceil(orderList.length / PAGE_SIZE);
        const startIndex = (page - 1) * PAGE_SIZE;
        const endIndex = (startIndex + PAGE_SIZE);
        const paginatedOrderList = orderList.slice(startIndex, endIndex);

        if (Array.isArray(orderList) && orderList.length > 0) {
            res.render('index', { 
                orderList: paginatedOrderList,
                currentPage: page,
                totalPages: totalPages
            });
        } else {
            res.render('noRecords');
        }
    } catch (error) {
        console.error('Error al obtener datos de la API:', error.message);
        res.status(500).send('Error al obtener datos de la API');
    }
});

app.get('/newOrder', (req, res) => {
    res.render('newOrder');
});

app.post('/createOrder', async (req, res) => {
    try {
        const orderData = {
            totalAmount: req.body.totalAmount,
            description: req.body.description,
            country: req.body.country
        };

        const response = await axios.post('https://c02-usa-east.integrate-test.boomi.com/ws/rest/ecommerce/v1/order/', orderData, {
            auth: {
                username: API_USER,
                password: API_TOKEN,
            },
        });

        res.send('<script>alert("Orden creada exitosamente"); window.location.href = "/";</script>');
    } catch (error) {
        console.error('Error al crear la orden:', error.message);
        res.status(500).send('Error al crear la orden');
    }
});

app.get('/searchOrder', async (req, res) => {
    try {
        const orderId = req.query.id;
        const response = await axios.get(`https://c02-usa-east.integrate-test.boomi.com/ws/rest/ecommerce/v1/orderDetails/${orderId}`, {
            auth: {
                username: API_USER,
                password: API_TOKEN,
            },
        });
        const orderData = response.data;
        res.render('searchOrder', { orderData });
    } catch (error) {
        console.error('Error al obtener datos de la API:', error.message);
        res.status(500).send('Error al obtener datos de la API');
    }
});

app.post('/sendToWarehouse', async(req, res) => {
    try {
        const orderData = {
            id: req.body.id,
            createdAt: req.body.createdAt,
            totalAmount: req.body.totalAmount,
            description: req.body.description,
            country: req.body.country,
            status: req.body.status,
        };

        console.log("Sending Order Data:", JSON.stringify(orderData));

        const response = await axios.post('https://boomi.tasklab.dev/ws/rest/warehouse/v1/orders/', orderData, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('Respuesta de Warehouse:', response);
        // await setTimeout(10000);

        res.send('<script>alert("Orden enviada exitosamente a Almacén"); window.location.href = "/";</script>');
    } catch (error) {
        console.error('Error al enviar la orden al Almacén:', error.message);
        res.status(500).send('Error al enviar la orden al Almacén');
    }
});


app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
