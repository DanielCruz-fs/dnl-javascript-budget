/* BUGET CONTROLLER */
var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
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
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(element => {
                return element.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }

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
        calculatePercentages: function(){
            data.allItems.exp.forEach(element => {
                element.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(element => {
                return element.getPercentage();
            });
            return allPerc;
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
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabels: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber = function(num, type){
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
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
            var finalNumber = formatNumber(obj.value, type);
            var html, element;
            // Create html string and replace some properties with current object
            if ( type === 'inc' ){
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix animated fadeInDown" id="inc-${ obj.id }">
                        <div class="item__description">${ obj.description }</div>
                        <div class="right clearfix">
                        <div class="item__value">${ finalNumber }</div>
                        <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div></div></div>`;
            }else if ( type === 'exp' ){
                element = DOMstrings.expensesContainer;
                html = `<div class="item clearfix animated fadeInDown" id="exp-${ obj.id }">
                        <div class="item__description">${ obj.description }</div>
                        <div class="right clearfix">
                        <div class="item__value">${ finalNumber }</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div></div></div>`;
            }
            // Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            document.getElementById('add-desc').value = '';
            document.getElementById('add-val').value = '';
            document.getElementById('add-desc').focus();
        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).innerHTML = '<p class="animated fadeInDown">' +
                                                                       formatNumber(obj.budget, type) + '</p>';
            document.querySelector(DOMstrings.incomeLabel).innerHTML = '<p class="animated bounceIn">' +
                                                                         formatNumber(obj.totalInc, 'inc') + '</p>';
            document.querySelector(DOMstrings.expensesLabel).innerHTML = '<p class="animated bounceIn">' +
                                                                            formatNumber(obj.totalExp, 'exp') + '</p>';
        
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabels);

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
        },
        displayMonth: function(){
            var now, months, month, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                         'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function(){
            var fields =  document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
                
            nodeListForEach(fields, function(element){
                element.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
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

        document.querySelector(DOM.container).addEventListener('click', crtlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function(){
        // Calculte the budget
        budgetController.calculateBudget();
        // Return Budget
        var budget = budgetController.getBudget();
        // Display the budget on the UI
        UIController.displayBudget(budget);
    };
    var updatePercentages = function(){
        //calculate percentages
        budgetController.calculatePercentages();
        //read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        //update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
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
            //calculate and update percentages
            updatePercentages();
        }
    };

    var crtlDeleteItem = function(event){
        var itemID, splitId, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitId = itemID.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            //1 delete the item from the data structure
            budgetController.deleteItem(type, ID);
            //2 delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //3 Update and Show the new budget
            updateBudget();
            //calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function(){
            console.log('Application has started...');
            UICtrl.displayMonth();
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();