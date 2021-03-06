import TrussLayout from './manager.js';
import CircularButton from './button.js';
import {_addStyle, getRandomColor} from './utils.js' ;

class Grid {
	constructor(_parent) {
		this.parentElement = _parent;
		this.childGrids = {};
		this.buttons = {};
		this.dimensions = {};
		this.buttonCounter = 0;
	}

	static defaultConfig() {
		return {
			background: getRandomColor(),
			float: 'left',
			position: 'relative'
		};
	}

	_config() {
		return Object.assign({}, Grid.defaultConfig(), this.dimensions);
	}

	setDimensions(_dim) {
		this.dimensions = _dim;
		return this;
	}

	_createDiv(id) {
		let elem = document.createElement('div');

		this.id = elem.id = id;
		_addStyle(elem, this._config());

		this.parentElement && this.parentElement.appendChild(elem);
		this.node = elem;
		return this;
	}

	removeDiv() {

	}

	getNode() {
		return this.node;
	}

	// return id of the grid
	getId() {
		return this.node.id;
	}

	addContainer(cb) {
		if (this.chartContainer) {
			cb && cb.call(null, id);
			return this.chartContainer;
		}
		let buttonStatus = this.maxButton,
			chartContainer = this.chartContainer = document.createElement('div'),
			config = {
				position: 'absolute',
				background: '#ffffff'
			},
			id = `${this.getId()}ChartContainer`,
			parentElement = this.getNode(),
			height = parentElement.offsetHeight - 10,
			width = parentElement.offsetWidth - 10,
			top = 5,
			left = 5;

		buttonStatus.horizontalCount.top > 1 && (top += 40) && (height -= 40);
		buttonStatus.horizontalCount.bottom > 1 && (height -= 40);
		buttonStatus.verticalCount.left > 1 && (left += 40) && (width -= 40);
		buttonStatus.verticalCount.right > 1 && (width -= 40);

		config.top = `${top}px`;
		config.left = `${left}px`;
		config.height = `${height}px`;
		config.width = `${width}px`;

		chartContainer.id = id;
		_addStyle(chartContainer, config);
		parentElement.appendChild(chartContainer);

		cb && cb.call(null, id);

		return chartContainer;
	}

	getContainerId() {
		let id = this.chartContainer ? this.chartContainer.id : this.addContainer().id;
		return id;
	}

	createSplit(split, cb) {
		let splitLayout = this.splitLayout = new TrussLayout(this.node);
		splitLayout.createSplit(split, cb);
		return this;
	}

	createGoldenSplit(or, cb) {
		let splitLayout = this.splitLayout = new TrussLayout(this.node);
		splitLayout.createGoldSplit(or, cb);
		return this;
	}

	addButton(contentConf, orientation, events) {
		if (!this._canAddButton(orientation)) {
			return this;
		}
		let config = {
				position: this._getButtonConfig(orientation),
				content: this._parseContentConfig(contentConf)
			},
			id = `${this.getId()}Button${this.buttonCounter}`,
			btnInstance = this.buttons[id] = new CircularButton(this.getNode(), config),
			btn;

		btn = btnInstance.render().getNode();

		if (events && Array.isArray(events)) {
			events.forEach(i => {
				i.name && i.callback && this._addEvent(btn, i.name, i.callback);
			});
		} else if (events && typeof events === 'object') {
			events.name && events.callback && this._addEvent(btn, events.name, events.callback);
		}
		return btn;
	}

	_addEvent(elem, name, cb) {
		typeof name === 'string' && typeof cb === 'function' && elem.addEventListener(name, cb);
		return this;
	}

	_parseContentConfig(conf) {
		let contentConfig = {};
		switch (typeof conf) {
			case 'string':
				contentConfig.type = 'a';
				contentConfig.innerHTML = conf;
				break;
			case 'object':
				if (conf.text) {
					contentConfig.type = 'a';
					contentConfig.innerHTML = conf.text;
				} else if (conf.src) {
					contentConfig.type = 'img';
					contentConfig.src = conf.src;
				} else {
					contentConfig = conf;
				}
				break;
			default:
				contentConfig.type = 'a';
				contentConfig.innerHTML = '';
		}
		return contentConfig;
	}
	/**
	 * Generates JSON Schema for button Orientation
	 * @returns {ob} - JSON object
	 */
	_generateOrientationObj() {
		let i = ['top', 'bottom'],
			ii = ['left', 'right'],
			iii = ['horizontal', 'vertical'],
			ob = {};

		i.forEach(_i => {
			ob[_i] = {};
			ii.forEach(_ii => {
				ob[_i][_ii] = {};
				iii.forEach(_iii => {
					ob[_i][_ii][_iii] = {
						isModified: false
					};
					ob[_i][_ii][_iii][_i] = 0;
					ob[_i][_ii][_iii][_ii] = 0;
				});
			});
		});

		return ob;
	}

	_parsePosition (str) {
		let position = {
				'T': 'top',
				'L': 'left',
				'R': 'right',
				'B': 'bottom'
			},
			posStr;
		if(str && str.length == '2') {
			posStr = `${position[str[0].toUpperCase()]}-${position[str[1].toUpperCase()]}`;
		} else {
			posStr = str.replace(/\s/g, '') || 'top-left'; // white spaces removed
		}

		return posStr;
	}

	_getButtonConfig (or) {
		let position = or.position,
			HORIZONTAL = 'horizontal',
			orientation = or.orientation || HORIZONTAL,
			str = this._parsePosition(position),
			posArr = str.split('-'),
			status = this.orientation || (this.orientation = this._generateOrientationObj()),
			currentPos = {};

		posArr.forEach((str) => {
			status[str] && posArr.forEach((lr) => {
				let _posObj = status[str][lr];
				if (_posObj) {
					for (let i in _posObj) {
						if (i === orientation) {
							currentPos[str] = `${_posObj[i][str]}px`;
							currentPos[lr] = `${_posObj[i][lr]}px`;

							orientation === HORIZONTAL ? (_posObj[i][lr] += 40, this.maxButton[orientation + 'Count'][str]++) :
								(_posObj[i][str] += 40, this.maxButton[orientation + 'Count'][lr]++);

							!_posObj[i]['isModified'] && (_posObj[i]['isModified'] = true);
						} else {
							if (!_posObj[i]['isModified']) {
								orientation === HORIZONTAL ? (_posObj[i][str] += 40, this.maxButton[orientation + 'Count'][lr]++) :
									(_posObj[i][lr] += 40, this.maxButton[orientation + 'Count'][str]++);

								_posObj[i]['isModified'] = true;
							}
						}

					}
				}
			});
		});

		return currentPos;
	}
	/**
	 * checks the total number of buttons added and returns boolean if any more buttons can be added or not
	 * @param {object} obj - orientation configaration
	 * @returns {}
	 */
	_canAddButton(obj) {
		let orientation = `${obj.orientation}Count`,
			pos = this._parsePosition(obj.position),//obj.position.replace(/\s/g, ''),
			posArr = pos.split('-'),
			currentBtnStatus = this.maxButton || (this.maxButton = this._calculateMaxButton()),
			position = ((_or, _posArr) => {
				let _pos = null;
				if (_or === 'horizontal') {
					_posArr.forEach(i => {
						(i === 'top' || i === 'bottom') && (_pos = i);
					});
				} else {
					_posArr.forEach(i => {
						(i === 'left' || i === 'right') && (_pos = i);
					});
				}
				return _pos;
			})(obj.orientation, posArr);

		return currentBtnStatus[orientation][position] < this.maxButton[obj.orientation];
	}

	_calculateMaxButton() {
		let oh = this.node.offsetHeight,
			ow = this.node.offsetWidth,
			btnSize = 40;

		this.maxButton || (this.maxButton = {
			horizontal: Math.floor(ow / btnSize),
			vertical: Math.floor(oh / btnSize),
			horizontalCount: {
				top: 1,
				bottom: 1
			},
			verticalCount: {
				left: 1,
				right: 1
			}
		});

		return this;
	}
}

export default Grid;