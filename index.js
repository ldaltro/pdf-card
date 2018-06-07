const pdfFiller = require('pdffiller');
const fs = require('fs');
const csv = require('csvtojson');
const chalk = require('chalk');
const PDFMerge = require('pdf-merge');

const csvInput = './sample_input.csv';

const cardModels = {
  'type_a': './sample_pdf.pdf',
  'type_b': './sample_pdf.pdf',
  'type_c': './sample_pdf.pdf',
};

let totalOrdersCount = 0;
let numberOfOrdersProcessed = 0;
const generatedPdfs = [];

function generateCard(sourcePdf, result, data) {
  pdfFiller.fillForm(sourcePdf, result, data, (err) => {
    if(err) {
      console.error(`${chalk.red('Something went wrong')}${err}`);
    } 
    if(totalOrdersCount === numberOfOrdersProcessed) {
       // Merge the pdfs by type
      const type_aPdfs = [];
      const type_bPdfs = [];
      const type_cPdfs = [];

      fs.readdirSync('./output/type_a/').forEach(file => {
        type_aPdfs.push('./output/type_a/' + file);
      });

      fs.readdirSync('./output/type_b/').forEach(file => {
        type_bPdfs.push('./output/type_b/' + file);
      });

      fs.readdirSync('./output/type_c/').forEach(file => {
        type_cPdfs.push('./output/type_c/' + file);
      });

      console.log(`${chalk.magenta('Generating type_a cards...')}`);
      PDFMerge(type_aPdfs, {output: './output/type_a.pdf'}).then((buffer) => {
        console.log(`${chalk.green('type_a card generation compeleted')}`);
      });
      console.log(`${chalk.red('Generating type_b cards...')}`);
      PDFMerge(type_bPdfs, {output: './output/type_b.pdf'}).then((buffer) => {
        console.log(`${chalk.green('type_b card generation compeleted')}`);
      });
      console.log(`${chalk.yellow('Generating type_c cards...')}`);
      PDFMerge(type_cPdfs, {output: './output/type_c.pdf'}).then((buffer) => {
        console.log(`${chalk.green('type_c card generation compeleted')}`);
      });
    } else {
      numberOfOrdersProcessed++;
    }
  });
}

csv().fromFile(csvInput).then((cardList) => {
  const sourcePdf = './input/type_a_sample.pdf';
  const  sources = {
    'type_a': './input/type_a_sample.pdf',
    'type_b': './input/type_b_sample.pdf',
    'type_c': './input/type_c_sample.pdf',
  };
  totalOrdersCount = cardList.length - 1;

  cardList.map((card) => {
    const data = {
      'Front': card.front_message,
      'Code': card.order_id,
      'Inside': card.back_message,
    };
    const result = './output/' + card.card_type + '/' + card.order_id + '.pdf';
    generateCard(sources[card.card_type], result, data);
  });
});

