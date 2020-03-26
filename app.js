var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    this.percentage =
      totalIncome > 0 ? Math.round((this.value / totalIncome) * 100) : -1;
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(item => {
      sum += item.value;
    });
    data.total[type] = sum;
  };

  var data = {
    allItems: { exp: [], inc: [] },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem;

      if (data.allItems[type].length > 0)
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      else ID = 0;

      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function(type, id) {
      var itemToDelete;

      itemToDelete = data.allItems[type].filter(item => {
        return item.id == id;
      })[0];

      console.log(type, id);
      console.log(itemToDelete);

      if (itemToDelete) {
        data.allItems[type].splice(
          data.allItems[type].indexOf(itemToDelete),
          1
        );
      }
    },

    calculateBudget: function() {
      calculateTotal("exp");
      calculateTotal("inc");

      data.budget = data.total.inc - data.total.exp;

      data.percentage =
        data.total.inc > 0
          ? Math.round((data.total.exp / data.total.inc) * 100)
          : -1;
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(ex => {
        ex.calcPercentage(data.total.inc);
      });
    },

    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(ex => {
        return ex.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.total.inc,
        totalExpense: data.total.exp,
        percentage: data.percentage
      };
    },

    test: function() {
      console.log(data);
    }
  };
})();

var UIController = (function() {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    addButton: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentagelabel: ".budget__expenses--percentage",
    container: ".container",
    itemPercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  formatNumber = function(num, type) {
    var splitNum, int, dec, sign;
    num = Math.abs(num);
    num = num.toFixed(2);

    splitNum = num.split(".");
    int = splitNum[0];

    int =
      int.length > 3
        ? int.substr(0, int.length - 3) +
          "," +
          int.substr(int.length - 3, int.length)
        : int;

    dec = splitNum[1];

    sign = type === "exp" ? "-" : "+";

    return sign + " " + int + "." + dec;
  };
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    getDomStrings: function() {
      return DOMStrings;
    },

    addListItem: function(item, type) {
      var html, newHtml, element;

      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div>' +
          ' <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">' +
          '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expenseContainer;
        html =
          ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>' +
          ' <div class="right clearfix"> <div class="item__value"> %value%</div><div class="item__percentage">21%</div>' +
          '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
          " </div></div></div>";
      }

      newHtml = html.replace("%id%", item.id);
      newHtml = newHtml.replace("%description%", item.description);
      newHtml = newHtml.replace("%value%", formatNumber(item.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorId) {
      var element = document.getElementById(selectorId);
      element.parentNode.removeChild(element);
    },

    clearFields: function() {
      var fields;
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + "," + DOMStrings.inputValue
      );

      fields.forEach(f => {
        f.value = "";
      });
      fields[0].focus();
    },

    displayBudget: function(budget) {
      var type = budget.budget > 0 ? "inc" : "exp";
      (document.querySelector(
        DOMStrings.budgetLabel
      ).textContent = formatNumber(budget.budget, type)),
        (document.querySelector(
          DOMStrings.incomeLabel
        ).textContent = formatNumber(budget.totalIncome, type)),
        (document.querySelector(
          DOMStrings.expenseLabel
        ).textContent = formatNumber(budget.totalExpense, type)),
        (document.querySelector(DOMStrings.percentagelabel).textContent =
          budget.percentage > -1 ? budget.percentage + "%" : "--");
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.itemPercentageLabel);
      fields.forEach(element => {
        console.log(Array.prototype.indexOf.call(fields, element));
        console.log(element);
        var percentage =
          percentages[Array.prototype.indexOf.call(fields, element)];
        element.textContent = percentage > 0 ? percentage + "%" : "---";
      });
    },

    displayMonth: function() {
      var now, year, month;

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];

      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DOMStrings.dateLabel).textContent =
        monthNames[month] + " " + year;
    },

    changeType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );
      fields.forEach(f => {
        f.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.addButton).classList.toggle('red');
    }
  };
})();

var controller = (function(budgetCtrl, UICtrl) {
  var DOM = UICtrl.getDomStrings();

  var setupEventListeners = function() {
    document.querySelector(DOM.addButton).addEventListener("click", function() {
      addItem();
    });

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        addItem();
      }
    });

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeType);

    document.querySelector(DOM.container).addEventListener("click", deleteItem);
  };

  var addItem = function() {
    var input, newItem;
    input = UICtrl.getInput();

    if (input.description !== "" && input.value !== NaN && input.value > 0) {
      newItem = budgetController.addItem(
        input.type,
        input.description,
        input.value
      );

      UICtrl.addListItem(newItem, input.type);

      UICtrl.clearFields();

      updateBudget();

      updatePercentages();
    }
  };

  var deleteItem = function(event) {
    var itemId, splitId, type, Id;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      Id = splitId[1];
    }
    budgetCtrl.deleteItem(type, Id);

    UICtrl.deleteListItem(itemId);

    updateBudget();
  };

  var updateBudget = function() {
    budgetCtrl.calculateBudget();

    var budget = budgetCtrl.getBudget();

    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    budgetCtrl.calculatePercentages();

    var percentages = budgetCtrl.getPercentages();

    UICtrl.displayPercentages(percentages);
  };
  return {
    init: function() {
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: -1
      });
      setupEventListeners();

      UICtrl.displayMonth();
    }
  };
})(budgetController, UIController);

controller.init();
