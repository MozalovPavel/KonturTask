var currentWidthMtxB = 2,
	currentHeightMtxB = 2,
	LOWERBOUND = 2,
	UPPERBOUND = 10,
	currentHeightMtxA = 2,
	currentWidthMtxA = 2;
//Отрисовывает начальную картинку и устанавливает обработчики. 
function init(){
	drawing('A','');
	drawing('B','');
	drawing('C','');

	placementNameForMatrix();

	var $win =  $(window),
		$bodyCalc = $('#bodyCalc'),
		$radio = $('.radio');
	// Изменение высоты тела калькулятора в зависимости от окна браузера
	$win.on('resize scroll',function(){
		var bodyHeight = document.body.scrollHeight;
		$bodyCalc.css('height', bodyHeight);
	});
	$('#swapMtxBtn').on('click', function(){
		swapMtxBtn();
	});
	$('#multiplyMatrixBtn').on('keydown', function(event){
		if(event.keyCode == 13){
			$(this).click();
		}
	});			
	$radio.on({
		keyup: function(){
			$('*').removeClass('focused');
			$('.radio:checked').addClass('focused');
		},
		blur: function(){
			$('*').removeClass('focused');
		}
	});
	$('div, .control, #multiplyMatrixBtn, .cell').on({
		click: function(event){
			placementNameForMatrix();
			if(event.target.id != 'multiplyMatrixBtn' && event.target.className != 'cell'){
				updateError('');
			}else if(event.target.id == 'multiplyMatrixBtn'){
				multiplicationMatrix(); 
			}
			if(($(event.target).hasClass('control'))){
				$(this).blur();
			}
		}
	});
	$('#cleaningBtn').on('click', function(){
		cleaningMatrix();
	});
	var $radioBoxA = $('#matrixSwitchA'),
		$radioBoxB = $('#matrixSwitchB');
	$('.changeColumnBar, .changeStringBar').on('click', function(event){
		var functionsArray = {
				'changeStringBar control add': addString,
				'changeColumnBar control add': addColumn,
				'changeStringBar control dlt': dltString,
				'changeColumnBar control dlt': dltColumn
			},
			functionAddOrDel =  functionsArray[this.className + ' ' + event.target.className]; 
		if(functionAddOrDel){
			if($radioBoxA.prop('checked')){
				functionAddOrDel('A');
			} else if($radioBoxB.prop('checked')){
				functionAddOrDel('B');
			}
			drawing('C','');
		}
	});
}
function onlyRationalNumbers(input){
	var clearValue = input.value.replace(/[^-\d.,]/, ''), //очищаем поле от лишних знаков
	minusPosition = clearValue.indexOf('-');
	clearValue = clearValue.replace(/-/g, '');
	while(isNaN(Number(clearValue.replace(/,/,'.')))){ //Number видит десятичные числа с точкой. Но нам бы хотелось вводить дробные числа с запятой. Поэтому замняем для Number-а запятую на точку.
		clearValue = clearValue.slice(0,-1);
	}
	if(minusPosition == 0){ // Если введенное число было отрицательным, то добавим минус
		clearValue = '-'+clearValue;
	}
	input.value = clearValue;
}	
//Отрисовывает матрицу по массиву или по пустой строке.		
function drawing(mtxID, array){
	var startDataCurrentMtx = getStartDataById(mtxID),
		heightCurrentMtx = startDataCurrentMtx.height,
		widthCurrentMtx = startDataCurrentMtx.width,
		placeHolder = startDataCurrentMtx.placeholder,
		$currentTable = document.getElementById('table'+mtxID),
		$mtx = $('#boxMatrix'+mtxID),
		visibleNameMtx = (mtxID == 'C')? '': mtxID,
		$cell = $('.cell'),
		$newTable = document.createElement('table');
	if($currentTable){
		$($currentTable).remove();// Оборачиваем в $() для IE
	}
	$newTable.id = 'table'+mtxID;
	for (var i = 0; i < heightCurrentMtx; i++) {
		var newRow = $newTable.insertRow(i);
		for (var j = 0; j < widthCurrentMtx; j++) {
			var newCell = newRow.insertCell(j),
			value = (array == '')? '': array[i][j];
			var newInput = document.createElement('input');
			newInput.type = 'text';
			newInput.name = placeHolder+(i+1)+","+(j+1);
			newInput.placeholder = placeHolder+(i+1)+","+(j+1);
			newInput.value = value;
			$(newInput).addClass('cell');
			newCell.appendChild(newInput);
		}
	}
	$mtx.append($newTable);
	$mtx.append($newTable).append('<span>'+visibleNameMtx+'</span>');	
	$cell.on({
		focus: function(){
			updateError('');
			$('#btnPanel').css('background', '#4DA0FF');
		},
		blur: function(){
			$('#btnPanel').css('background', '#aaa');
		},
		keyup: 	function(){
			onlyRationalNumbers(this);
		},
		keydown: function(){
			onlyRationalNumbers(this)
		}
	});
	$('#boxMatrixC .cell').each(function(){
		$(this).addClass('disabled')
			.prop('disabled', true);
	});
}
//Возвращает высоту, ширину и plaseholder таблицы по id
function getStartDataById(id){
	var size = {};

	size.height = (id == 'B')? currentHeightMtxB: currentHeightMtxA;
	size.width = (id == 'A')? currentWidthMtxA : currentWidthMtxB;
	size.placeholder = (id == 'A')?'a':(id == 'B')? 'b': 'c';

	return size;
}
//Изменяет глобальные переменные высоты и ширины
function changeCurrentWAndH(){
	var $tableA =  document.getElementById('tableA'),
		$tableB = document.getElementById('tableB');
	currentWidthMtxA = $tableA.rows[0].cells.length;
	currentWidthMtxB = $tableB.rows[0].cells.length;
	currentHeightMtxA = $tableA.rows.length;
	currentHeightMtxB = $tableB.rows.length;
}

//Удаление колонки заданой матрицы
function dltColumn(mtxID){
	var	startDataCurrentMtx = getStartDataById(mtxID),
		heightCurrentMtx = startDataCurrentMtx.height,
		widthCurrentMtx = startDataCurrentMtx.width,
		$currentTable = document.getElementById('table'+mtxID),
		placeHolder = startDataCurrentMtx.placeholder;
	if(widthCurrentMtx > LOWERBOUND){

		var rows = $currentTable.rows;
		for (var i = 0; i < heightCurrentMtx; i++) {
			rows[i].deleteCell(-1);
		}
		changeCurrentWAndH();
	}
}
//Добавление колонки
function addColumn(mtxID){
	var startDataCurrentMtx = getStartDataById(mtxID),
		heightCurrentMtx = startDataCurrentMtx.height,
		widthCurrentMtx = startDataCurrentMtx.width,
		$currentTable = document.getElementById('table'+mtxID),
		placeHolder = startDataCurrentMtx.placeholder;
	if(widthCurrentMtx < UPPERBOUND){
		var rows = $currentTable.rows;
		for (var i = 0; i < heightCurrentMtx; i++) {
			var newCell = rows[i].insertCell(-1),
				newInput = document.createElement('input');
			newInput.type = 'text';
			newInput.placeholder = placeHolder+(i+1)+","+(widthCurrentMtx+1);
			$(newInput).addClass('cell');
			newCell.appendChild(newInput);
		}
		changeCurrentWAndH();
	}
}
//Удаление строки заданной матрицы
function dltString(mtxID){
	var startDataCurrentMtx = getStartDataById(mtxID), 
		heightCurrentMtx = startDataCurrentMtx.height,
		widthCurrentMtx = startDataCurrentMtx.width,
		$currentTable = document.getElementById('table'+mtxID),
		placeHolder = startDataCurrentMtx.placeholder;
	if(heightCurrentMtx > LOWERBOUND){
		$currentTable.deleteRow(-1);
		changeCurrentWAndH();
	}
}
//Добавление строки
function addString (mtxID) {
	var	startDataCurrentMtx = getStartDataById(mtxID),
		heightCurrentMtx = startDataCurrentMtx.height,
		widthCurrentMtx = startDataCurrentMtx.width,
		$currentTable = document.getElementById('table'+mtxID),
		placeHolder = startDataCurrentMtx.placeholder;
	if(heightCurrentMtx < UPPERBOUND){
		var newRow = $currentTable.insertRow(-1);
		for (var i = 0; i < widthCurrentMtx; i++) {
			var newCell = newRow.insertCell(-1);
				newInput = document.createElement('input');
			newInput.type = 'text';
			newInput.placeholder = placeHolder+(heightCurrentMtx+1)+","+(i+1);
			$(newInput).addClass('cell');
			newCell.appendChild(newInput);
		}
		changeCurrentWAndH();
	}
}
//Ворачивает массив ячеек из заданой матрицы
function readFromTable(mtxID){
	var startDataCurrentMtx = getStartDataById(mtxID),
		$currentTable = document.getElementById('table'+mtxID),
		arrayFromMtx = [],
		heightCurrentMtx = startDataCurrentMtx.height;
		widthCurrentMtx = startDataCurrentMtx.width;
	for (var i = 0; i < heightCurrentMtx; i++) {
		arrayFromMtx[i] = [];
		for (var j = 0; j < widthCurrentMtx; j++) {
			var value = $currentTable.rows[i]
				.cells
				.item(j)
				.getElementsByTagName('input')[0]
				.value;
			arrayFromMtx[i][j] = (value === undefined)? '': value;
		};
	};
	return arrayFromMtx;
}
//Чистит матрицы
function cleaningMatrix(){
	var $cells = $('.cell');
	for (var i = 0; i < $cells.length; i++) {
		$cells[i].value = '';
	};
}
//Умножает матрицы
function multiplicationMatrix(){
	var arrayA = readFromTable('A'),
		arrayB = readFromTable('B'),
		arrayC = readFromTable('C');
	if(currentWidthMtxA == currentHeightMtxB){
		updateError('');
		for (var i = 0; i < currentHeightMtxA; i++) {		
			for (var j = 0; j < currentWidthMtxB; j++) {
				arrayC[i][j] = 0;
				for (var k = 0; k < currentWidthMtxA; k++) {
					if(arrayA[i][k] == '' || arrayB[k][j] == ''){
						arrayC[i][j] = '';
						updateError('Введите даные во все ячейки');
						drawing('C','')
						return;
						// break;
					} else
						arrayC[i][j] = Number(arrayC[i][j]) + arrayA[i][k]*arrayB[k][j];
				};
			};
		};
		drawing('C', arrayC);
	}
	else{
		updateError('Высота матрицы В не равна ширине матрицы А');
	}
}
//Обновляет состояние ошибки, т.е. добавляет текст и красит колонку в красный, или убирает ошибку и ворачивает цвет 
function updateError(errorMessage){
	var $error = $('#error'),
		$leftColumn = $('#btnPanel');
	if(errorMessage != '')
		$leftColumn.css('background', '#f2b8b8');
	else{
		$leftColumn.css('background', '#aaa');
	}
	$error.text(errorMessage);
}
//Меняет местами матрицы А и В
function swapMtxBtn(){
	var $tableA = $('#tableA'),
		$tableB = $('#tableB');
		contanerID = $tableA.attr('id'),
		arrayA = readFromTable('A'),
		arrayB = readFromTable('B'),
		contanerWidthAndHeight = currentHeightMtxA;			
	currentHeightMtxA = currentHeightMtxB;
	currentHeightMtxB = contanerWidthAndHeight;
	contanerWidthAndHeight = currentWidthMtxB;
	currentWidthMtxB = currentWidthMtxA;
	currentWidthMtxA = contanerWidthAndHeight;
	$tableA.attr('id', $tableB.attr('id'));
	$tableB.attr('id', contanerID);		
	drawing('C', '');
	drawing('A', arrayB);
	drawing( 'B', arrayA);	
}
//Размещает имена матриц строго по центру
function placementNameForMatrix(){
	var height = ($('#boxMatrixA').height()-$('#boxMatrixA > span').height())/2,
		width = ($('#boxMatrixB').width()-$('#boxMatrixB > span').width())/2;
	$('#boxMatrixA > span').css('top', height);
	$('#boxMatrixB > span').css('left', width);	 	
}