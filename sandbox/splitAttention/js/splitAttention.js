const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const PROPORTION_SEPARATOR = 0.1;
const STIM_NUMBER = 4;
const TARGET_NUMBER = 2;
const STIM_DIAMETER = 50;

makeSplitAttentionStructure = (queryString, horizontal) => {
    const canvas = document.querySelector(queryString);
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const context = canvas.getContext("2d");
    const rect1 = {
        start: {x: 0, y: 0},
        end: horizontal ?
            {x: canvas.width, y: (canvas.height * (1 - PROPORTION_SEPARATOR)) / 2 }
            : {x: (canvas.width * (1 - PROPORTION_SEPARATOR)) / 2, y: canvas.height },
    };
    const rect2 = {
        start: horizontal ?
            {x: 0, y: (canvas.height * (1 + PROPORTION_SEPARATOR)) / 2}
            : {x: (canvas.width * (1 + PROPORTION_SEPARATOR)) / 2, y: 0 }, 
        end: {x: canvas.width, y: canvas.height } 
    }

    rect1.stimuli = makeStimuli(STIM_NUMBER, TARGET_NUMBER, rect1)
    rect2.stimuli = makeStimuli(STIM_NUMBER, TARGET_NUMBER, rect2)

    return {
        canvas: canvas,
        context: context,
        rect1: rect1,
        rect2: rect2
    }
}

randInt = (min, max) => {
    return Math.floor(min + Math.random() * (max + 1 - min));
}

makeStimuli = (stimNumber, targetNumber, rectangle) => {
    const stimArray = [];

    for (let i = 0; i < stimNumber; i++) {
        
        stimArray.push(
            {
                center: {
                    x: randInt(rectangle.start.x + 1 + STIM_DIAMETER / 2, rectangle.end.x - STIM_DIAMETER / 2),
                    y: randInt(rectangle.start.y + 1 + STIM_DIAMETER / 2, rectangle.end.y - STIM_DIAMETER / 2)
                },
                direction: Math.random() * Math.PI * 2,
                isTarget: true,
            }
        )
    }

    return stimArray;
}

drawRectangle = (context, start, end) => {
    context.moveTo(start.x, start.y);
    context.lineTo(start.x, end.y);
    context.lineTo(end.x, end.y);
    context.lineTo(end.x, start.y);
    context.lineTo(start.x, start.y);
    context.stroke();
}

drawBorders = ({canvas, context, rect1, rect2}) => {
    drawRectangle(context, rect1.start, rect1.end);
    drawRectangle(context, rect2.start, rect2.end);
}

drawCircle = (context, stim) => {
    context.beginPath();
    context.arc(stim.center.x, stim.center.y, STIM_DIAMETER / 2, 0, 2 * Math.PI);
    context.fill();
}

drawStimuli = ({context, rect1, rect2}) => {
    rect1.stimuli.forEach(s => drawCircle(context, s))
    rect2.stimuli.forEach(s => drawCircle(context, s))
}

launchSimulation = (splitAttentionStructure) => {
    drawBorders(splitAttentionStructure);
    drawStimuli(splitAttentionStructure);
}

const splitAttentionStructures = [
    makeSplitAttentionStructure("#verticalSplit", false),
    makeSplitAttentionStructure("#horizontalSplit", true),
]

splitAttentionStructures.forEach(c => launchSimulation(c));