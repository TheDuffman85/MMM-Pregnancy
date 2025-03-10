/* global Module */

/* Magic Mirror
 * Module: MMM-Pregnancy
 *
 * By Jose Forte
 * MIT Licensed.
 */

Module.register("MMM-Pregnancy", {
  pregnancyResults: {
    conception: '',
    duedate: '',
    fetalage: {
      weeks: '',
      days: ''
    }
  },
  defaults: {
    header: 'Pregnancy',
    date: '01/31/2020', // format MM/DD/YYYY
    USDateFormat: false,
    showConceptionDate: false,
    daysStartWithZero: true
  },

  getStyles: function() {
    return ["MMM-Pregnancy.css", "font-awesome.css"];
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      es: "translations/es.json",
      sv: "translations/sv.json",
	    de: "translations/de.json",
    }
  },

  start: function() {
    Log.info("Starting module: " + this.name);
        
    // Schedule update interval every hour
    var self = this;
    setInterval(function() {
      self.updateDom();
    }, 3600000)
  },

  getHeader: function() {
    return this.config.header;
  },

  getDom: function() {
    var moduleWrapper = document.createElement("div");

    this.pregnancyCalc();
    
    moduleWrapper.appendChild(this.getPregnancyInfo());
    if (this.config.showConceptionDate) {
      moduleWrapper.appendChild(this.getConceptionDate());
    }
    moduleWrapper.appendChild(this.getDueDate());
    moduleWrapper.appendChild(this.getProgress());

    return moduleWrapper;
  },

  getPregnancyInfo: function() {
    var weekNr = this.pregnancyResults.fetalage.weeks,
        dayNr = this.pregnancyResults.fetalage.days;

    var counterWrapper = document.createElement("div");
    var wrapper = document.createElement("table");
    wrapper.className = "pregnancy-table";
    
    counterWrapper.appendChild(wrapper);

    var infoRow = document.createElement("tr"),
        weeksWrapper = document.createElement("td"),
        daysWrapper = document.createElement("td");
   
    weeksWrapper.innerHTML = weekNr;
    weeksWrapper.className = 'digits';
    daysWrapper.innerHTML = dayNr;
    daysWrapper.className = 'digits';

    infoRow.appendChild(weeksWrapper);
    infoRow.appendChild(daysWrapper);
    wrapper.appendChild(infoRow);

    var textsRow = document.createElement("tr"),
        textWeeksWrapper = document.createElement("td"),
        textDaysWrapper = document.createElement("td");

    textsRow.className = 'textsRow';
    textWeeksWrapper.innerHTML = this.translate('WEEKS');
    textDaysWrapper.innerHTML = this.translate('DAYS');

    textsRow.appendChild(textWeeksWrapper);
    textsRow.appendChild(textDaysWrapper);

    wrapper.appendChild(textsRow);
    
    counterWrapper.className = "pregnancy";

    return counterWrapper;
  },

  getConceptionDate: function() {
    var conceptionDateWrapper = document.createElement("div");
    conceptionDateWrapper.className = 'date';

    conceptionDateWrapper.innerHTML = this.translate('The conception date was') + ' ' + this.pregnancyResults.conception;

    return conceptionDateWrapper;
  },

  getDueDate: function() {
    var dueDateWrapper = document.createElement("div");
    dueDateWrapper.className = 'date';

    dueDateWrapper.innerHTML = this.translate('The due date is') + ' ' + this.pregnancyResults.duedate;

    return dueDateWrapper;
  },

  getProgress: function() {
    var t1Bar,
        t2Bar,
        t3Bar,
        weekNr = this.pregnancyResults.fetalage.weeks,
        trimesterInfo = this.trimesterCalc(weekNr),
        trimesterTrim = trimesterInfo.trim,
        trimesterPercent = trimesterInfo.percent;

    if (trimesterTrim == 1) {
      t1Bar = trimesterPercent; // calculate where of the 1st trimester we are
      t2Bar = 0; // not yet
      t3Bar = 0; // not yet
    } else if (trimesterTrim == 2) {
      t1Bar = 100; // completed
      t2Bar = trimesterPercent; // calculate where of the 2nd trimester we are
      t3Bar = 0; // not yet
    } else if (trimesterTrim == 3) {
      t1Bar = 100; // completed
      t2Bar = 100; // completed
      t3Bar = trimesterPercent; // calculate where of the 3rd trimester we are
    }
    var yearBarCell = document.createElement("div");
    yearBarCell.className = "pregnancy-timeline__trimesters";
    yearBarCell.style = "width: 100%;";

    var firstTrimesterContainer = document.createElement("div");
    firstTrimesterContainer.style = "float: left; width: 32%; margin-right:2px; background-color: #444444;";
	
    var firstTrimesterProgress = document.createElement("div");
    firstTrimesterContainer.appendChild(firstTrimesterProgress);
	
    var firstTrimesterText = document.createElement("span");
    firstTrimesterText.innerHTML = this.translate('1st');
    firstTrimesterText.style = 'font-size: 25px;color: #ee5486';
    firstTrimesterProgress.appendChild(firstTrimesterText);
    firstTrimesterProgress.style = "height:24px;background-color:#FFFFFF;width:" + t1Bar + "%";

    var secondTrimesterContainer = document.createElement("div");
    secondTrimesterContainer.style = "float: left; width: 32%; margin-right:2px; background-color: #444444;";
    
    var secondTrimesterProgress = document.createElement("div");
    secondTrimesterContainer.appendChild(secondTrimesterProgress);

    var secondTrimesterText = document.createElement("span");
    secondTrimesterText.style = 'font-size: 25px;color: #ee5486';
    secondTrimesterText.innerHTML = this.translate('2nd');
    secondTrimesterProgress.appendChild(secondTrimesterText);
    secondTrimesterProgress.style = "height:24px;background-color:#FFFFFF;width:" + t2Bar + "%";

    var thirdTrimesterContainer = document.createElement("div");
    thirdTrimesterContainer.style = "float: left; width: 32%; margin-right:2px; background-color: #444444;";
    
    var thirdTrimesterProgress = document.createElement("div");
    thirdTrimesterContainer.appendChild(thirdTrimesterProgress);

    var thirdTrimesterText = document.createElement("span");
    thirdTrimesterText.innerHTML = this.translate('3rd');
    thirdTrimesterText.style = 'font-size: 25px;color: #ee5486';
    thirdTrimesterProgress.appendChild(thirdTrimesterText);
    thirdTrimesterProgress.style = "height:24px;background-color:#FFFFFF;width:"+ t3Bar + "%";

    yearBarCell.appendChild(firstTrimesterContainer);
    yearBarCell.appendChild(secondTrimesterContainer);
    yearBarCell.appendChild(thirdTrimesterContainer);

    return yearBarCell;
  },
  // calculate which trimester we are and progress percent
  trimesterCalc: function(weekNr) {
    var res = {
      trim: 0,
      percent: 0
    }
    if (weekNr > 0 && weekNr <=13) {
      res.trim = 1;
      if (weekNr >= 1 && weekNr <=4 ) res.percent = 25;
      else if (weekNr >= 5 && weekNr <=8 ) res.percent = 50;
      else if (weekNr > 8 && weekNr <13 ) res.percent = 75;
      else res.percent = 95;
    } else if (weekNr > 13 && weekNr <=27) {
      res.trim = 2;
      if (weekNr >= 14 && weekNr <=17 ) res.percent = 25;
      else if (weekNr >= 18 && weekNr <=21 ) res.percent = 50;
      else if (weekNr > 21 && weekNr <27 ) res.percent = 75;
      else res.percent = 95;
    } else if (weekNr > 27) {
      res.trim = 3;
      if (weekNr >= 27 && weekNr <=29 ) res.percent = 25;
      else if (weekNr >= 30 && weekNr <=33 ) res.percent = 50;
      else if (weekNr >= 34 && weekNr <=36) res.percent = 75;
      else if (weekNr >= 37 && weekNr <=38 ) res.percent = 95;
      else res.percent = 100;
    }

    return res;
  },
  // calculate conception date, due date and fetalage (weeks + days)
  pregnancyCalc: function() {
    var menstrual = new Date(),
        ovulation = new Date(),
        duedate = new Date(),
        today = new Date(),
        cycle = 28,
        luteal = 13;
    
    menstrualinput = new Date(this.config.date);
    menstrual.setTime(menstrualinput.getTime());

    ovulation.setTime(menstrual.getTime() + (cycle*86400000) - (luteal*86400000));	
	
    var conception = this.dispDate(ovulation);
    this.pregnancyResults.conception = conception;

    duedate.setTime(ovulation.getTime() + 266*86400000);
	
    this.pregnancyResults.duedate = this.dispDate(duedate);

    var fetalage = 14 + 266 - ((duedate - today) / 86400000);
    weeks = parseInt(fetalage / 7);
    days = Math.ceil(fetalage % 7);

    if (this.config.daysStartWithZero) {
      --days;
    }

    this.pregnancyResults.fetalage.weeks = weeks;
    this.pregnancyResults.fetalage.days = days;

    return false;
  },

  dispDate: function(dateObj) {
    month = dateObj.getMonth()+1;
    month = (month < 10) ? "0" + month : month;
  
    day   = dateObj.getDate();
    day = (day < 10) ? "0" + day : day;
  
    year  = dateObj.getYear();
    if (year < 2000) year += 1900;
    
    if (this.config.USDateFormat) return (month + "/" + day + "/" + year);
    else return (day + "." + month + "." + year);
  }

})