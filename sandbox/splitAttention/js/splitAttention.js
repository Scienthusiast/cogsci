const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 700;
const PROPORTION_SEPARATOR = 0.1;
const STIM_NUMBER = 5;
const TARGET_NUMBER = 2;
const STIM_DIAMETER = 50;
const FRAME_DURATION = 50;
const MAX_TRIALS = 1000;
const VELOCITY = 4;
const X_COLLISION = "x";
const Y_COLLISION = "y";

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

stimCollision = (center1, center2) => {
    return Math.sqrt(Math.pow(center1.x - center2.x, 2) + Math.pow(center1.y - center2.y, 2)) < STIM_DIAMETER;
}

borderCollision = (center, rectangle) => {
    if (center.x - (STIM_DIAMETER / 2) <= rectangle.start.x || center.x + (STIM_DIAMETER / 2) >= rectangle.end.x) {
        return X_COLLISION;
    }
    if (center.y - (STIM_DIAMETER / 2) <= rectangle.start.y || center.y + (STIM_DIAMETER / 2) >= rectangle.end.y) {
        return Y_COLLISION;
    }
    return null;
}

getNewStimPosition = (stimArray, rectangle) => {
    let trialNumber = 1;
    do {
        let newCoords = {
            x: randInt(rectangle.start.x + 1 + STIM_DIAMETER / 2, rectangle.end.x - STIM_DIAMETER / 2),
            y: randInt(rectangle.start.y + 1 + STIM_DIAMETER / 2, rectangle.end.y - STIM_DIAMETER / 2)
        }
        if (!stimArray.some(stim => {return (stimCollision(stim.center, newCoords))})) {
           return newCoords; 
        }
        trialNumber += 1;
    } while (trialNumber < MAX_TRIALS)
    return {x: 0, y: 0}
}

makeStimuli = (stimNumber, targetNumber, rectangle) => {
    const stimArray = [];
    let targetRemaining = targetNumber;

    for (let i = 0; i < stimNumber; i++) {
        const isTarget = targetRemaining > 0 ? true : false;
        if (isTarget) targetRemaining = targetRemaining - 1;
        
        const newStim = {
            center: getNewStimPosition(stimArray, rectangle),
            direction: Math.random() * Math.PI * 2,
            isTarget: isTarget,
        }
        stimArray.push(newStim);
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

moveStimuli = (stim, rect) => {
    stim.center.x += Math.cos(stim.direction) * VELOCITY;
    stim.center.y += Math.sin(stim.direction) * VELOCITY;

    const collision = borderCollision(stim.center, rect);
    
    // if (collision) {
    //     stim.direction += (Math.PI / 2) % (Math.PI * 2); 
    // }
    // /*
    if (collision === Y_COLLISION) {
        stim.direction = -stim.direction; //Math.sin(s.direction);// / Math.cos(s.direction)
    }
    else if (collision === X_COLLISION) {
        stim.direction += (Math.PI / 2) % (Math.PI * 2) 
    }
}

moveAllStimuli = ({rect1, rect2}) => {
    rect1.stimuli.forEach(s => {moveStimuli(s, rect1)})
    rect2.stimuli.forEach(s => {moveStimuli(s, rect2)})
}

drawState = (splitAttentionStructure) => {
    drawBorders(splitAttentionStructure);
    drawStimuli(splitAttentionStructure);
}

const splitAttentionStructures = [
    makeSplitAttentionStructure("#verticalSplit", false),
    makeSplitAttentionStructure("#horizontalSplit", true),
]

splitAttentionStructures.forEach(c => drawState(c));

setInterval(function() {
    splitAttentionStructures.forEach(c => {
        c.context.clearRect(0, 0, c.canvas.width, c.canvas.height);
        moveAllStimuli(c);
        drawState(c);
    })
}, FRAME_DURATION)