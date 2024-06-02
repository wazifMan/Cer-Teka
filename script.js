const elements = [
    'neutron', 'proton', 'elektron', 'oksigen', 'hidrogen', 'natrium', 'klorin', 'karbon', 'ferum', 'magnesium', 'nitrogen', 'silikon', 'kuprum', 'kalium', 'aluminium'
];

const combinations = {
    'neutronproton': 'nukleus',
    'nukleuselektron': 'atom',
    'atomatom': 'molekul',
    'oksigenoksigen': 'gas oksigen',
    'oksigenhidrogen': 'hidroksida',
    'gas oksigenhidrogen': 'air',
    'natriumklorin': 'garam',
    'karbongas oksigen': 'karbon dioksida',
    'ferumgas oksigen': 'ferum(iii) oksida',
    'nitrogenhidrogen': 'ammonia',
    'karbonhidrogengas oksigen': 'glukosa',
    'natrium hidroksidakarbon dioksida': 'natrium bikarbonat',
    'magnesiumsulfur': 'magnesium sulfida',
    'karbonhidrogen': 'metana',
    'silikongas oksigen': 'silikon dioksida',
    'kuprumgas oksigen': 'kuprum(ii) oksida',
    'aluminiumgas oksigen': 'aluminium oksida',
    'natriumhidroksida': 'natrium hidroksida',
    'kaliumnitrat': 'kalium nitrat',
};

let discoveredElements = new Set(elements);
let elementCounter = 0;

const elementList = document.getElementById('element-list');
const workspaceArea = document.getElementById('workspace-area');
const trashBin = document.getElementById('trash-bin');
const suggestionsDiv = document.getElementById('suggestions');
const suggestBtn = document.getElementById('suggest-btn');
const clearBtn = document.getElementById('clear-btn');
const totalDiscovered = document.getElementById('total-discovered');

function renderElements() {
    elementList.innerHTML = '';
    discoveredElements.forEach(element => {
        const li = document.createElement('li');
        const img = document.createElement('img');
        img.src = `images/${element}.png`;
        img.alt = element;
        img.draggable = false;
        img.onerror = () => {
            img.src = 'images/placeholder.png';
            console.error(`Error loading image: images/${element}.png`);
        };
        li.appendChild(img);
        li.draggable = true;
        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', element);
        });
        elementList.appendChild(li);
    });

    const elementImages = document.querySelectorAll('#element-list img');
    elementImages.forEach(img => {
        img.addEventListener('mouseenter', showElementNameTooltip);
        img.addEventListener('mouseleave', hideElementNameTooltip);
    });
}

function showElementNameTooltip(e) {
    const elementName = e.target.alt;
    const tooltip = document.createElement('div');
    tooltip.className = 'element-tooltip';
    tooltip.textContent = elementName;
    document.body.appendChild(tooltip);

    tooltip.style.left = e.pageX + 'px';
    tooltip.style.top = e.pageY + 20 + 'px';
}

function hideElementNameTooltip() {
    const tooltips = document.querySelectorAll('.element-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
}

function createElementNode(element, x, y) {
    const div = document.createElement('div');
    const elementId = `element-${elementCounter++}`;
    div.id = elementId;
    div.className = 'element';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.backgroundImage = `url('images/${element}.png')`;
    div.draggable = true;
    div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', element);
        e.dataTransfer.setData('offsetX', e.offsetX);
        e.dataTransfer.setData('offsetY', e.offsetY);
        e.dataTransfer.setData('elementId', elementId);
    });
    div.addEventListener('dragend', (e) => {
        const elementId = e.dataTransfer.getData('elementId');
        const element = document.getElementById(elementId);
        const trashBinRect = trashBin.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        if (!(elementRect.right < trashBinRect.left ||
            elementRect.left > trashBinRect.right ||
            elementRect.bottom < trashBinRect.top ||
            elementRect.top > trashBinRect.bottom)) {
            workspaceArea.removeChild(element);
        }
        document.body.style.backgroundImage = 'url("images/background.jpg")';
    });
    div.addEventListener('drag', checkElementCollision);
    workspaceArea.appendChild(div);
    return div;
}

function handleElementCombination(el1, el2, el3 = null) {
    const element1 = el1.style.backgroundImage.split('/').pop().split('.').shift();
    const element2 = el2.style.backgroundImage.split('/').pop().split('.').shift();
    const newElement = combinations[element1 + element2] || combinations[element2 + element1];

     let newElementThreeWay = null;
    if (el3) {
        const element3 = el3.style.backgroundImage.split('/').pop().split('.').shift();
        newElementThreeWay = combinations[element1 + element2 + element3] ||
                             combinations[element1 + element3 + element2] ||
                             combinations[element2 + element1 + element3] ||
                             combinations[element2 + element3 + element1] ||
                             combinations[element3 + element1 + element2] ||
                             combinations[element3 + element2 + element1];
    }

    if (newElementThreeWay && !discoveredElements.has(newElementThreeWay)) {
        alert(`You discovered ${newElementThreeWay}!`);
        discoveredElements.add(newElementThreeWay);
        renderElements();

        // Remove elements used for the combination
        workspaceArea.removeChild(el1);
        workspaceArea.removeChild(el2);
        workspaceArea.removeChild(el3);


        const newElementNode = createElementNode(newElementThreeWay, (parseInt(el1.style.left) + parseInt(el2.style.left) + parseInt(el3.style.left)) / 3, (parseInt(el1.style.top) + parseInt(el2.style.top) + parseInt(el3.style.top)) / 3);

        // Apply effect to the newly created element
        newElementNode.classList.add('combined');

        // Remove the class after the animation ends
        newElementNode.addEventListener('animationend', () => {
            newElementNode.classList.remove('combined');
        });

        updateTotalDiscoveredCount();
    }
}

function checkElementCollision() {
    const elements = Array.from(workspaceArea.getElementsByClassName('element'));
    elements.forEach((el1, idx1) => {
        elements.forEach((el2, idx2) => {
           if (idx1 < idx2) {
                const rect1 = el1.getBoundingClientRect();
                const rect2 = el2.getBoundingClientRect();
                if (!(rect1.right < rect2.left ||
                    rect1.left > rect2.right ||
                    rect1.bottom < rect2.top ||
                    rect1.top > rect2.bottom)) {
                    
                    // Check for collisions with a third element
                    elements.forEach((el3, idx3) => {
                        if (idx1 < idx3 && idx2 < idx3) {
                            const rect3 = el3.getBoundingClientRect();
                            if (!(rect1.right < rect3.left ||
                                rect1.left > rect3.right ||
                                rect1.bottom <                                rect3.top ||
                                rect2.right < rect3.left ||
                                rect2.left > rect3.right ||
                                rect2.bottom < rect3.top ||
                                rect2.top > rect3.bottom)) {
                                handleElementCombination(el1, el2, el3);
                            }
                        }
                    });

                    // Check for two-element combinations
                    handleElementCombination(el1, el2);
                }
            }
        });
    });
}

workspaceArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const element = e.dataTransfer.getData('text/plain');
    const offsetX = e.dataTransfer.getData('offsetX');
    const offsetY = e.dataTransfer.getData('offsetY');
    const x = e.clientX - workspaceArea.offsetLeft - offsetX;
    const y = e.clientY - workspaceArea.offsetTop - offsetY;

    createElementNode(element, x, y);
    checkElementCollision();
});

trashBin.addEventListener('dragover', (e) => {
    e.preventDefault();
});

trashBin.addEventListener('drop', (e) => {
    e.preventDefault();
    const elementId = e.dataTransfer.getData('elementId');
    const element = document.getElementById(elementId);

    if (element) {
        workspaceArea.removeChild(element);
    }
});

trashBin.addEventListener('dragenter', () => {
    trashBin.style.backgroundImage = 'url("images/trash_hover.png")';
});

trashBin.addEventListener('dragleave', () => {
    trashBin.style.backgroundImage = '';
});

workspaceArea.addEventListener('dragover', (e) => {
    e.preventDefault();
});

workspaceArea.addEventListener('dragenter', () => {
    document.body.style.backgroundImage = 'url("images/background_hover.jpg")';
});

workspaceArea.addEventListener('dragleave', () => {
    document.body.style.backgroundImage = 'url("images/background.jpg")';
});

function suggestCombination() {
    suggestionsDiv.innerHTML = '';
    const suggestions = [];
    discoveredElements.forEach(element1 => {
        discoveredElements.forEach(element2 => {
            if (element1 !== element2) {
                                const combination1 = element1 + element2;
                const combination2 = element2 + element1;
                if (combinations[combination1] && !discoveredElements.has(combinations[combination1])) {
                    suggestions.push(`${element1} + ${element2} = ${combinations[combination1]}`);
                } else if (combinations[combination2] && !discoveredElements.has(combinations[combination2])) {
                    suggestions.push(`${element2} + ${element1} = ${combinations[combination2]}`);
                }
            }
        });
    });

    if (suggestions.length === 0) {
        suggestionsDiv.innerHTML = '<p>No new combinations available.</p>';
    } else {
        suggestions.forEach(suggestion => {
            const p = document.createElement('p');
            p.textContent = suggestion;
            suggestionsDiv.appendChild(p);
        });
    }
}

suggestBtn.addEventListener('click', suggestCombination);

function clearWorkspace() {
    workspaceArea.innerHTML = ''; // Remove all elements from the workspace
    updateTotalDiscoveredCount(); // Update total discovered count when workspace is cleared
}

clearBtn.addEventListener('click', clearWorkspace);

function updateTotalDiscoveredCount() {
    totalDiscovered.textContent = discoveredElements.size; // Update total discovered count
}

renderElements();
updateTotalDiscoveredCount(); // Initialize total discovered count

// Function to update the total discovered count automatically when a new combination is discovered
function handleElementCombinationWithAutoUpdate(el1, el2, el3 = null) {
    const element1 = el1.style.backgroundImage.split('/').pop().split('.').shift();
    const element2 = el2.style.backgroundImage.split('/').pop().split('.').shift();
    const newElement = combinations[element1 + element2] || combinations[element2 + element1];

    let newElementThreeWay = null;
    if (el3) {
        const element3 = el3.style.backgroundImage.split('/').pop().split('.').shift();
        newElementThreeWay = combinations[element1 + element2 + element3] ||
                             combinations[element1 + element3 + element2] ||
                             combinations[element2 + element1 + element3] ||
                             combinations[element2 + element3 + element1] ||
                             combinations[element3 + element1 + element2] ||
                             combinations[element3 + element2 + element1];
    }

    if (newElementThreeWay && !discoveredElements.has(newElementThreeWay)) {
        const notification = document.createElement('div');
        notification.classList.add('new-element-notification');
        const img = document.createElement('img');
        img.src = `images/${newElement}.png`;
        img.alt = newElement;
        const p = document.createElement('p');
        p.textContent = `You discovered ${newElement}!`;
        notification.appendChild(img);
        notification.appendChild(p);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);

        discoveredElements.add(newElement);
        renderElements();

        // Remove elements used for the combination
        workspaceArea.removeChild(el1);
        workspaceArea.removeChild(el2);
        workspaceArea.removeChild(el3);

        // Add new element to workspace
        const newElementNode = createElementNode(newElementThreeWay, (parseInt(el1.style.left) + parseInt(el2.style.left) + parseInt(el3.style.left)) / 3, (parseInt(el1.style.top) + parseInt(el2.style.top) + parseInt(el3.style.top)) / 3);

        // Apply effect to the newly created element
        newElementNode.classList.add('combined');

        // Remove the class after the animation ends
        newElementNode.addEventListener('animationend', () => {
            newElementNode.classList.remove('combined');
        });

        // Update total discovered count
        updateTotalDiscoveredCount();
        playCombineSound();
        
    } else if (newElement && !discoveredElements.has(newElement)) {
        const notification = document.createElement('div');
        notification.classList.add('new-element-notification');
        const img = document.createElement('img');
        img.src = `images/${newElement}.png`;
        img.alt = newElement;
        const p = document.createElement('p');
        p.textContent = `You discovered ${newElement}!`;
        notification.appendChild(img);
        notification.appendChild(p);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);

        discoveredElements.add(newElement);
        renderElements();

        // Remove elements used for the combination
        workspaceArea.removeChild(el1);
        workspaceArea.removeChild(el2);

        // Add new element to workspace
        const newElementNode = createElementNode(newElement, (parseInt(el1.style.left) + parseInt(el2.style.left)) / 2, (parseInt(el1.style.top) + parseInt(el2.style.top)) / 2);

        // Apply effect to the newly created element
        newElementNode.classList.add('combined');

        // Update total discovered count
        updateTotalDiscoveredCount();
        playCombineSound();
    }
}

function playCombineSound() {
    const combineSound = document.getElementById('combine-sound');
    combineSound.play().catch(error => {
        console.error('Failed to play combine sound:', error);
    });
}

// Overriding the original handleElementCombination with the new one that updates total discovered count automatically
handleElementCombination = handleElementCombinationWithAutoUpdate;

// Background Sound
document.addEventListener("DOMContentLoaded", function() {
    const backgroundSound = document.getElementById('background-sound');
    // Play background sound automatically
    backgroundSound.play().catch(error => {
        console.log('Autoplay prevented. User interaction needed to play the sound.', error);
    });

    // Example: Adding controls to start and stop the sound
    const playButton = document.createElement('button');
    playButton.textContent = 'Play Sound';
    playButton.addEventListener('click', () => backgroundSound.play());
    document.body.appendChild(playButton);

    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop Sound';
    stopButton.addEventListener('click', () => backgroundSound.pause());
    document.body.appendChild(stopButton);
});

// Device Type Check
function isSmartphone() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Add coding for smartphone
if (isSmartphone()) {
    // Your smartphone-specific JavaScript code here
} else {
    // Add coding for windows
    // Your Windows-specific JavaScript code here
}
