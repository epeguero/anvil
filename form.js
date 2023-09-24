function test() {
    function htmlToElement(html) {
        var template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }

    // state | props
    function getListData() {
        return Array.from(document.body.querySelector('ul').querySelectorAll('li'))
            .map(e => e.textContent);
    }
    
    function insertListItem(text) {
        const list = document.body.querySelector('ul');
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(text));
        list.appendChild(li);
    }

    function onClick() {
        const input = document.body.querySelector('input');
        if(input.type == 'hidden') { input.type = 'text'; input.focus();}
        else { input.focus(); submitText(); }
    }

    function submitText() {
        const input = document.body.querySelector('input');
        if(getListData().includes(input.value)) {
            input.setCustomValidity(`Cannot have duplicate: '${input.value}'`);
            input.reportValidity();
            input.focus();
        }
        else if (input.value) {
            input.setCustomValidity('');
            document.body.querySelector('form').requestSubmit();
        }
    }
    // --- //

        
    const elem = htmlToElement(
        `
        <div>
            <form>
              <button type='button'>+</button>
              <label for='my-text-data'><input type='hidden' id='my-text-data' name='my-text-data' placeholder='Add list item' value=''/></label>
            </form>
            <ul>
            </ul>
        </div>
        `
    );

    document.body.innerHTML = "";
    document.body.appendChild(elem);

    const form = document.body.querySelector('form');
    const button = form.querySelector('button');
    const input = form.querySelector('input');
    
    form.addEventListener('submit', (e) => {
        console.log('submit');
        e.preventDefault();

        const form = e.currentTarget;
        const data = Array.from(new FormData(form).entries())
            .reduce(
                (accum, [key, value]) => ({...accum, [key]: value}),
                {}
            );
        console.log(data);

        insertListItem(data['my-text-data']);
        console.log('calling form reset');
        form.reset();
        // order matters: hidden inputs cannot be reset
        form.querySelector('input').type = 'hidden'; 
    });


    button.addEventListener('click', onClick);

    input.addEventListener('blur', submitText);
} 