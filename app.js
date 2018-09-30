/* BUGET CONTROLLER */
var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            //Create new id
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            //Create new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //push it into our data structure
            data.allItems[type].push(newItem);
            //return the new element or object
            return newItem;
        },
        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    };
})();
/* UI CONTROLLER */
var UIController = (function(){
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'
    };
    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        addListItem: function(obj, type){
            var html, element;
            // Create html string and replace some properties with current object
            if ( type === 'inc' ){
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="income-${ obj.id }">
                        <div class="item__description">${ obj.description }</div>
                        <div class="right clearfix">
                        <div class="item__value">${ obj.value }</div>
                        <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div></div></div>`;
            }else if ( type === 'exp' ){
                element = DOMstrings.expensesContainer;
                html = `<div class="item clearfix" id="expense-${ obj.id }">
                        <div class="item__description">${ obj.description }</div>
                        <div class="right clearfix">
                        <div class="item__value">${ obj.value }</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div></div></div>`;
            }
            // Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },
        clearFields: function(){
            document.getElementById('add-desc').value = '';
            document.getElementById('add-val').value = '';
            document.getElementById('add-desc').focus();
        },
        getDomstrings: function(){
            return DOMstrings;
        }
    }
})();
/* GLOBAL APP CONTROLLER */
var controller = (function(budgetCtrl, UICtrl){
    var setupEventListeners = function(){
        var DOM = UIController.getDomstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
        event.keyCode === 13 ? ctrlAddItem() : false ;
    });
    };
    
    var updateBudget = function(){
        // Calculte the budget
        budgetController.calculateBudget();
        // Return Budget
        var budget = budgetController.getBudget();
        // Display the budget on the UI
        console.log(budget);
    };
    var ctrlAddItem = function(){
        var input, newItem;
        // Get the field input data
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // Add item to the UI
            UICtrl.addListItem(newItem, input.type);
            // Clear fields after adding data
            UIController.clearFields();
            // Calculate and update budget
            updateBudget();
        }
    };

    return {
        init: function(){
            console.log('Application has started...');
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();