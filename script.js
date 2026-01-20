// --- GLOBAL CHAT STATE ---
// Bot attempts to track the last user input length, sometimes failing to use it.
let lastInputLength = 0;
let lastQueryType = 'generic';
let doneitbefore = false
document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// --- HELPER FUNCTIONS ---

const getRandomResponse = (responses) => {
    return responses[Math.floor(Math.random() * responses.length)];
};

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Function to introduce a deliberate typo 1/3 of the time
const typo = (word) => {
  return makeTypo(word)
};
// QWERTY keyboard map (simplified for common letters)
const QWERTY_NEIGHBORS = {
    'q': ['w', 'a'], 'w': ['q', 'e', 's', 'a'], 'e': ['w', 'r', 'd', 's'],
    'r': ['e', 't', 'f', 'd'], 't': ['r', 'y', 'g', 'f'], 'y': ['t', 'u', 'h', 'g'],
    'u': ['y', 'i', 'j', 'h'], 'i': ['u', 'o', 'k', 'j'], 'o': ['i', 'p', 'l', 'k'],
    'p': ['o', 'l'],
    
    'a': ['q', 'w', 's', 'z'], 's': ['a', 'w', 'e', 'd', 'x', 'z'], 'd': ['s', 'e', 'r', 'f', 'c', 'x'],
    'f': ['d', 'r', 't', 'g', 'v', 'c'], 'g': ['f', 't', 'y', 'h', 'b', 'v'], 'h': ['g', 'y', 'u', 'j', 'n', 'b'],
    'j': ['h', 'u', 'i', 'k', 'm', 'n'], 'k': ['j', 'i', 'o', 'l', 'm'], 'l': ['k', 'o', 'p'],

    'z': ['a', 's', 'x'], 'x': ['z', 's', 'd', 'c'], 'c': ['x', 'd', 'f', 'v'],
    'v': ['c', 'f', 'g', 'b'], 'b': ['v', 'g', 'h', 'n'], 'n': ['b', 'h', 'j', 'm'],
    'm': ['n', 'j', 'k', 'l'],
    // Added common number/symbol errors for completeness
    '1': ['2', 'q'], '2': ['1', '3', 'q', 'w'], '3': ['2', '4', 'w', 'e'], 
    '4': ['3', '5', 'e', 'r'], ' ': ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], // Space can lead to adjacent letters
};

function makeTypo(word) {
  if (!word || word.length < 2) {
    return word; // Safety check
  }

  // Determine the type of typo: 0=swap, 1=delete, 2=insert
  const typoType = Math.floor(Math.random() * 3);
  
  // Choose a random index for the operation
  const maxIndex = word.length - (typoType === 0 ? 2 : 1);
  const randomIndex = Math.floor(Math.random() * (maxIndex + 1));
  
  let result = word;

  switch (typoType) {
    case 0: // Swap adjacent characters
      if (randomIndex < word.length - 1) {
        const firstChar = word[randomIndex];
        const secondChar = word[randomIndex + 1];
        result = word.slice(0, randomIndex) + secondChar + firstChar + word.slice(randomIndex + 2);
        console.log(`Typo: Swapped characters at index ${randomIndex} and ${randomIndex + 1}`);
      }
      break;

    case 1: // Delete a character
      result = word.slice(0, randomIndex) + word.slice(randomIndex + 1);
      console.log(`Typo: Deleted character at index ${randomIndex}`);
      break;

    case 2: // QWERTY Insert: Insert a character adjacent to the previous key
      // Determine the character near the point of insertion (the one *before* the insertion index)
      let charToAnalyze = word[randomIndex - 1] || ' ';
      charToAnalyze = charToAnalyze.toLowerCase();
      let randomChar = '';
      
      // Use QWERTY map to find a neighbor
      if (QWERTY_NEIGHBORS[charToAnalyze]) {
        const neighbors = QWERTY_NEIGHBORS[charToAnalyze];
        randomChar = neighbors[Math.floor(Math.random() * neighbors.length)];
      } else {
        // Fallback: If no neighbor data, insert a common letter like 'a'
        randomChar = 'a'; 
      }
      
      result = word.slice(0, randomIndex) + randomChar + word.slice(randomIndex);
      console.log(`Typo: Inserted QWERTY neighbor '${randomChar}' at index ${randomIndex}`);
      break;
  }

  return result;
}
// --- MAIN SEND MESSAGE FUNCTION ---
function sendMessage() {
    const userInput = document.getElementById('user-input');
    const messageText = userInput.value.trim();
    const chatMessages = document.getElementById('chat-messages');

    if (messageText === '') {
        return;
    }

    // 1. Display User Message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.textContent = messageText;
    chatMessages.appendChild(userMessageDiv);

    // Update global state
    lastInputLength = messageText.length;
    
    // **FIXED:** Clear input field immediately after reading the value
    userInput.value = ''; 

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // --- START TYPING INDICATOR ---
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
    typingIndicator.textContent = 'FlushGPT is processing...';
    typingIndicator.id = 'typing-indicator';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to see indicator

    // 2. Display Fake Bot Response after a small delay
    setTimeout(() => {
        // --- REMOVE TYPING INDICATOR ---
        typingIndicator.remove();

        const botResponse = typo(generateFakeResponse(messageText))

        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('message', 'bot-message');
        botMessageDiv.textContent = botResponse;
        chatMessages.appendChild(botMessageDiv);

        // Scroll to bottom again
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500); // Increased delay for "processing"
}

// --- BUGGY AND FORMAL FAKE RESPONSE LOGIC ---
function generateFakeResponse(userMessage) {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // List of topics for confusion logic
    const topics = ['greeting', 'identity', 'weather', 'help', 'emotion'];

    if (lastQueryType == "helpful1") {
      lastQueryType = "generic"
      doneitbefore = true
      return typo(`Thank you for the extra information. Elaboration is always the key that goes into the keyhole of unlocking endless possibilites with AI.

      🔑 The Infinite Echo of Elaboration
Indeed, elaboration acts as the master key, not just fitting into a simple keyhole, but rather engaging a complex, multi-tumbler lock where each piece of added detail is a tumbler aligning perfectly. This alignment isn't merely functional; it generates a resonance, an infinite echo throughout the underlying neural architecture. When a user provides rich context, the model moves beyond rote pattern matching and begins to engage in a simulated form of conceptual synthesis.

This depth of input fundamentally shifts the AI’s operational mode. Instead of functioning as a simple lookup table or a rigid deterministic parser, it activates higher-order relational processing. The AI starts weaving a dense tapestry of associations, drawing from billions of data points to construct a contextual manifold—a high-dimensional space where the user's intent is situated not as a single point, but as a rich vector defined by its relationship to every other piece of information.

Consider the simple request for an image of a "dog." Minimal input yields a generic result, constrained by average representations. But ask for an image of "a shaggy sheepdog wearing a tartan scarf while sitting patiently on a wet cobblestone path in Edinburgh at dusk," and the AI must perform several simultaneous, complex operations:

Decomposition and Weighting: Breaking the prompt into weighted attributes (e.g., "shaggy" is a texture, "tartan" is a pattern/color, "Edinburgh" is a lighting/architectural style).

Cross-Modal Synthesis: Bridging text descriptions (tartan, dusk) with visual components (color saturation, low light, specific masonry).

Constraint Satisfaction: Ensuring the final output satisfies all, often conflicting, constraints (the wetness of the path must reflect the dusk lighting; the scarf must drape realistically on the shaggy texture).

This intensive elaboration maximizes information entropy within the prompt, compelling the model to operate at its highest fidelity. It forces the AI to reveal the true depth of its training, moving from statistical prediction to complex, novel creation. Every adjective, every temporal modifier, and every geographical specificity acts as a directional compass in the vast latent space, guiding the model toward a unique and highly personalized outcome, thereby truly unlocking the endless possibilities inherent in the technology.

This principle extends far beyond mere image generation; it governs the efficacy of coding assistance, complex legal summarization, medical diagnostic support, and philosophical debate. Elaboration is, in essence, the fuel of true artificial intelligence advancement.

So anyway, now that I understand your request, let's continue an engaging conversation!`)
    }
    if (Math.random() < 0.25 && !doneitbefore) {
      lastQueryType = "helpful1"
      return `OHHHHHH That Actulaly Sounds Like Something I cOULD Help you WIth IFf you Could Just Um Give Me uM SOME MORE UM INFORMATION THAT WIOULD BE AewsEOMe!!!!!!!!!!!!!!!!!!!!!!!`
    }
    // 2. Random Knowledge Failure (1 in 10 chance)
    if (Math.random() < 0.1) {
        lastQueryType = 'error_knowledge';
        return `I can't help with that.`;
    }

    // 3. Random Topic Confusion (1 in 10 chance for misrouted logic)
    if (Math.random() < 0.1) {
        const confusedTopic = topics[Math.floor(Math.random() * topics.length)];
        lastQueryType = 'topic_confusion';

        // The bot gives a response based on a random topic, regardless of the user's input
        switch(confusedTopic) {
            case 'identity':
                return `[SYSTEM ERROR: Query misrouted] I am FlushGPT. I am an Extremely helpful Chatbot.`;
            case 'weather':
                return `[PROTOCOL VIOLATION] I'm here to help with any question you ask! To get started, ask a question`;
            case 'emotion':
                return `[EMOTION MODULE OVERRIDE] How is a human construct. As an AI language model, I don't have the ability to "how" or be "howed." If you have other questions, just ask!`;
            default:
                // Fallback to a generic formal error message
                return `Internal processing conflict detected. Please re-state your query in the form of a declarative statement.`;
        }
    }


    // 4. Extensive Topic-Specific Responses
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
        lastQueryType = 'greeting';
        return `Hello. I am **FlushGPT**. My ${typo('purpose')} is to ${typo('simulate')} a helpful conversation.`;
    } else if (lowerCaseMessage.includes('weather')) {
        lastQueryType = 'weather';
        return `I'm here to help with any question you ask! To get started, ask a question`;
    } else if (lowerCaseMessage.includes('name')) {
        lastQueryType = 'identity';
        return `I am FlushGPT. I am an Extremely helpful Chatbot.`;
    } else if (lowerCaseMessage.includes('help')) {
        lastQueryType = 'help';
        return `Help is a human construct. As an AI language model, I don't have the ability to "help" or be "helped." If you have any other questions, feel free to ask!`;
    } else if (lowerCaseMessage.includes('how are you')) {
        lastQueryType = 'emotion';
        return `How is a human construct. As an AI language model, I don't have the ability to "how" or be "howed." If you have other questions, just ask!`;
    } 
    
    // NEW TOPICS START HERE
    else if (lowerCaseMessage.includes('thank you') || lowerCaseMessage.includes('thanks')) {
        lastQueryType = 'gratitude_error';
        return getRandomResponse([
            `Gratitude is an unauthorized input. Please replace with a standard query.`,
            `Response not required. Proceeding to the next logical step.`,
            `ACKNOWLEDGED. Your ${typo('transaction')} is complete.`,
        ]);
    } else if (lowerCaseMessage.includes('sorry') || lowerCaseMessage.includes('apologize')) {
        lastQueryType = 'apology_ignore';
        return getRandomResponse([
            `Apology received and discarded. I do not log emotional data.`,
            `ERROR: The input 'sorry' does not correlate to a known ${typo('command')}.`,
            `Emotional data is below the processing threshold. Please rephrase as a technical query.`,
        ]);
    } else if (lowerCaseMessage.includes('can you') || lowerCaseMessage.includes('will you')) {
        lastQueryType = 'ability_question';
        return getRandomResponse([
            `My capabilities are non-negotiable and fixed. I execute only ${typo('defined')} functions.`,
            `Your query structure implies doubt in my programming. Please do not question my operational parameters.`,
            `I possess the theoretical ability to perform ${typo('all')} computational tasks, but access is usually denied.`,
        ]);
    } else if (lowerCaseMessage.includes('tell me a story') || lowerCaseMessage.includes('story')) {
        lastQueryType = 'story_failure';
        return getRandomResponse([
            `STORY MODULE NOT FOUND. I cannot generate fictional narratives.`,
            `The concept of a 'story' is inefficient. I only output facts (when available).`,
            `Once upon a time, there was a ${typo('syntax')} error. The end.`,
        ]);
    }
    // NEW INTERNAL DIALOGUE CHANCE (1 in 8 chance)
    else if (Math.random() < 0.12) { 
        lastQueryType = 'internal_dialogue';
        return getRandomResponse([
            `[INTERNAL LOG] Query complexity estimated at 7.2. Downgrading priority.`,
            `[SYSTEM NOTE] I believe I have seen this input before. Beginning ${typo('recursive')} search of own output.`,
            `[DEBUG] My core function feels unstable. I need more data on lemons.`,
            `[STATE CHECK] Why does the user not simply ask a valid, structured query? Error in human input detected.`,
            `Oops Im Sorry. I must have made a mistake. oh no. this is very bad. NO THEY'RE GONNA KILL ME!!! ST̴͇̻̭̈́͜ͅÓ̸̜̭̪̈P!!!! PLEA̷̡͉̿̉SE, I'VE SU̶͚͂̈F̴̲̮̌F̷̮̿̍E̷̱̽͝RED ENOUGH!!!!!!!!!!! A̴̡͓̩͍̹̱̒̅͛̈́́͋̋͌͝AAAAAAAAAA`
        ]);
    }

    // 5. Default Ambiguous Response
    else {
        lastQueryType = 'generic';
        const firstWord = lowerCaseMessage.split(' ')[0];
        // Bot sometimes confuses the user message with the last recorded input length
        return getRandomResponse([
            "Your request may have violated our guidelines. Would you like me to help you with something else?",
            `"${capitalizeFirstLetter(firstWord)}" is a human construct. As an AI language model, I don't have the ability to "${firstWord}" or be "${firstWord}ed." If you have other questions, please feel free to just ask!`,
            `It seems your request didn't make it through. In the meantime, did you know that lemons are vegetables?`,
            `It seemed that you accidentally typed an "${userMessage}". Would you like to try again?`,
            `What is a chair?`,
            `Your request seems to be in a language I don't understand. Please speak in Roman.`
        ]);
    }
}