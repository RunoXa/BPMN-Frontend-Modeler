import $ from 'jquery';

import BpmnModeler from 'bpmn-js/lib/Modeler';
import BpmnModdle from 'bpmn-moddle';

import diagramXML from '../resources/newDiagram.bpmn';

var container = $('#js-drop-zone');

var modeler = new BpmnModeler({
  container: '#js-canvas'
});

function createNewDiagram() {
  openDiagram(diagramXML);
}

async function openDiagram(xml) {

  try {

    await modeler.importXML(xml);

    container
      .removeClass('with-error')
      .addClass('with-diagram');
  } catch (err) {

    container
      .removeClass('with-diagram')
      .addClass('with-error');

    container.find('.error pre').text(err.message);

    console.error(err);
  }
}

function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions
// eslint-disable-next-line no-unused-vars
let generateData = null;

$(function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);
    generateData = data;
    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(async function() {

    try {

      const { svg } = await modeler.saveSVG();

      setEncoded(downloadSvgLink, 'diagram.svg', svg);
    } catch (err) {

      console.error('Error happened saving svg: ', err);
      setEncoded(downloadSvgLink, 'diagram.svg', null);
    }

    try {
      const { xml } = await modeler.saveXML({ format: true });
      console.log({ xml });
      setEncoded(downloadLink, 'diagram.bpmn', xml);
    } catch (err) {

      console.error('Error happened saving XML: ', err);
      setEncoded(downloadLink, 'diagram.bpmn', null);
    }
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);
});

document.getElementById("generate").addEventListener("click", generate);

async function generate() {
  const { xml } = modeler.saveXML({ format: true });
  const strXML = { xml }.toString();

  // console.log({ strXML });

  const moddle = new BpmnModdle();

  const xmlStr =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">\n' +
      '  <bpmn2:process id="Process_1" isExecutable="false">\n' +
      '    <bpmn2:startEvent id="StartEvent_1">\n' +
      '      <bpmn2:outgoing>Flow_13vvskc</bpmn2:outgoing>\n' +
      '    </bpmn2:startEvent>\n' +
      '    <bpmn2:task id="Activity_18vk4s8" name="test">\n' +
      '      <bpmn2:incoming>Flow_13vvskc</bpmn2:incoming>\n' +
      '      <bpmn2:outgoing>Flow_164r785</bpmn2:outgoing>\n' +
      '    </bpmn2:task>\n' +
      '    <bpmn2:sequenceFlow id="Flow_13vvskc" sourceRef="StartEvent_1" targetRef="Activity_18vk4s8" />\n' +
      '    <bpmn2:endEvent id="Event_1cbeh9j">\n' +
      '      <bpmn2:incoming>Flow_164r785</bpmn2:incoming>\n' +
      '    </bpmn2:endEvent>\n' +
      '    <bpmn2:sequenceFlow id="Flow_164r785" sourceRef="Activity_18vk4s8" targetRef="Event_1cbeh9j" />\n' +
      '  </bpmn2:process>\n' +
      '  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n' +
      '    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">\n' +
      '      <bpmndi:BPMNEdge id="Flow_13vvskc_di" bpmnElement="Flow_13vvskc">\n' +
      '        <di:waypoint x="448" y="258" />\n' +
      '        <di:waypoint x="500" y="258" />\n' +
      '      </bpmndi:BPMNEdge>\n' +
      '      <bpmndi:BPMNEdge id="Flow_164r785_di" bpmnElement="Flow_164r785">\n' +
      '        <di:waypoint x="600" y="258" />\n' +
      '        <di:waypoint x="652" y="258" />\n' +
      '      </bpmndi:BPMNEdge>\n' +
      '      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">\n' +
      '        <dc:Bounds x="412" y="240" width="36" height="36" />\n' +
      '      </bpmndi:BPMNShape>\n' +
      '      <bpmndi:BPMNShape id="Activity_18vk4s8_di" bpmnElement="Activity_18vk4s8">\n' +
      '        <dc:Bounds x="500" y="218" width="100" height="80" />\n' +
      '        <bpmndi:BPMNLabel />\n' +
      '      </bpmndi:BPMNShape>\n' +
      '      <bpmndi:BPMNShape id="Event_1cbeh9j_di" bpmnElement="Event_1cbeh9j">\n' +
      '        <dc:Bounds x="652" y="240" width="36" height="36" />\n' +
      '      </bpmndi:BPMNShape>\n' +
      '    </bpmndi:BPMNPlane>\n' +
      '  </bpmndi:BPMNDiagram>\n' +
      '</bpmn2:definitions>\n';

  const {
    rootElement: definitions
  } = await moddle.fromXML(xmlStr);

// update id attribute
  definitions.set('id', 'NEW ID');

// add a root element
  const bpmnProcess = moddle.create('bpmn:Process', { id: 'MyProcess_1' });
  definitions.get('rootElements').push(bpmnProcess);

  console.log(definitions.get('rootElements').push(bpmnProcess));

}

// helpers //////////////////////

function debounce(fn, timeout) {

  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}

