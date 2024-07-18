require('dotenv').config()

const express = require('express')
const cors = require("cors");
const axios = require('axios')

const app = express()

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(cors());
app.use(express.static("public"));

app.get('/', (req, res) => {

    let auth = btoa(`${process.env.LOGIN_USERNAME}:${process.env.PASSWORD}`);

    axios.get('https://fedskillstest.coalitiontechnologies.workers.dev', {
        headers: {
            'Authorization': `Basic ${auth}`
        }
    }).then(function (data) {
        const patient = data.data[3]

        const diagnosisHistory = patient.diagnosis_history
        
        res.render('index', { patient, diagnosisHistory });

    }).catch(error => {
            console.error(error.data);
    });

})

app.listen(process.env.PORT, () => {
    console.log('Server started listening to port', process.env.PORT);
})