import React from 'react';
//import NumericInput from 'react-numeric-input';
import { Input } from 'semantic-ui-react'
import PRINTJ from 'printj'

// copied from INDI github repo: https://github.com/indilib/indi/blob/bda9177ef25c6a219ac3879994c6efcae3b2d1c6/libindi/libs/indicom.c#L117
// TODO: rewrite in a more modern/readable way
const sex2string = (format, value) => {
    let formatSpecifiers = format.substring(1, format.indexOf('m')).split('.').map(x => parseInt(x, 10));
    let width = formatSpecifiers[0] - formatSpecifiers[1];
    let fracSpecifier = formatSpecifiers[1].toString();
    let fracBase = { 9: 360000, 8: 36000, 6: 3600, 5: 600, 4: 60 };
    fracBase = fracSpecifier in fracBase ? fracBase[fracSpecifier] : fracBase[4];

    let isNegative = parseInt(value, 10) < 0;
    /* convert to an integral number of whole portions */
    let number = Math.trunc(Math.abs(value) * fracBase + 0.5);
    let d = Math.trunc(number / fracBase);
    let f = number % fracBase;
    let out = "";
    let m;
    let s;

    /* form the whole part; "negative 0" is a special case */
    if (isNegative && d === 0)
        out += PRINTJ.sprintf("%*s-0", width - 2, "");
    else
        out += PRINTJ.sprintf("%*d", width, isNegative ? -d : d);

    /* do the rest */
    switch (fracBase) {
        case 60: /* dd:mm */
            m = f / (fracBase / 60);
            out += PRINTJ.sprintf(":%02d", m);
            break;
        case 600: /* dd:mm.m */
            out += PRINTJ.sprintf(":%02d.%1d", f / 10, f % 10);
            break;
        case 3600: /* dd:mm:ss */
            m = f / (fracBase / 60);
            s = f % (fracBase / 60);
            out += PRINTJ.sprintf(":%02d:%02d", m, s);
            break;
        case 36000: /* dd:mm:ss.s*/
            m = f / (fracBase / 60);
            s = f % (fracBase / 60);
            out += PRINTJ.sprintf(":%02d:%02d.%1d", m, s / 10, s % 10);
            break;
        case 360000: /* dd:mm:ss.ss */
            m = f / (fracBase / 60);
            s = f % (fracBase / 60);
            out += PRINTJ.sprintf(":%02d:%02d.%02d", m, s / 100, s % 100);
            break;
        default:
            return value;
    }
    return out.trim()
}
// end INDI code


const isSexagesimal = format => format.endsWith('m')

const parseStringValue = (stringValue, format) => {
    stringValue = stringValue.trim();
    if(!isSexagesimal(format))
        return parseFloat(stringValue);
    let tokens = stringValue.split(':');
    let degs = parseFloat(tokens[0]);
    let sign = stringValue.startsWith('-') ? -1 : 1;
    if(tokens.length > 1)
        degs += sign * parseFloat(tokens[1])/60;
    if(tokens.length > 2)
        degs += sign * parseFloat(tokens[2])/3600;
    return degs;
}



const formatValue = (displayValue, format) => {
    if(isSexagesimal(format)) {
        return sex2string(format, displayValue);
    }
    let formatted = PRINTJ.sprintf(format, displayValue)
    return formatted;
}

// TODO: revisit when https://github.com/vlad-ignatov/react-numeric-input/pull/80 gets merged

class NumericInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: null };
    }

    onChange = (data) => {
        if(this.valueChangedTimer) {
            clearTimeout(this.valueChangedTimer);
        }
        this.setState({...this.state, value: data.value});
        this.valueChangedTimer = setTimeout( this.mergeState, 900);
        
    }

    mergeState = () => {
        if(! this.props.onChange || this.props.readOnly || this.state.value === null ) {
            return;
        }
        if(this.valueChangedTimer) {
            clearTimeout(this.valueChangedTimer);
            this.valueChangedTimer = null;
        }
        this.setValue(this.state.value);
    }

    setValue = (newValue) => {
        let value = this.props.parse(newValue);
        if(this.props.min !== undefined) {
            value = Math.max(value, this.props.min);
        }
        if(this.props.max !== undefined) {
            value = Math.min(value, this.props.max);
        }
        this.props.onChange(value);
        this.setState({...this.state, value: null });
    }

    value = () => this.state.value === null ? this.props.format(this.props.value) : this.state.value;

    step = (direction) => {
        if(! this.props.step) {
            return;
        }
        const newValue = this.props.value + (direction * this.props.step)
        this.setValue(`${newValue}`);
    }

    onKeyUp = (keyEvent) => {
        if(keyEvent.key === 'ArrowUp') {
            this.step(+1);
        }
        if(keyEvent.key === 'ArrowDown') {
            this.step(-1);
        }
    }

    render = () => {
        const  { value, format, parse, min, max, step, onChange, ...args } = this.props;
        return (
            <Input
                onKeyUp={e => this.onKeyUp(e)}
                onBlur={() => this.mergeState()}
                className='indi-number'
                value={this.value()}
                onChange={(e, data) => this.onChange(data)}
                type='text' {...args}
                
            />
        )
    }
}

const EditableInput = ({value, format, min, max, step, onChange, ...args}) => (
    <NumericInput
        value={value}
        onChange={onChange}
        size='small'
        format={v => formatValue(v, format)}
        parse={s => parseStringValue(s, format)}
        min={min}
        max={max}
        step={step}
        {...args}
    />
)

const CurrentValue = ({value, format, ...args}) => (
    <NumericInput

        value={value}
        size='small'
        readOnly={true}
        format={v => formatValue(v, format)}
        parse={s => parseStringValue(s, format)}
        {...args}
    />
)

const INDINumber = ({value, isWriteable, displayValue, addPendingValues, hideCurrent}) => {
    const onChange= (numValue, stringValue) => addPendingValues({ [value.name]: numValue })

    if(hideCurrent)
        return <EditableInput label={value.label} format={value.format} min={value.min} max={value.max} step={value.step} value={displayValue} onChange={onChange} fluid />
    if(!isWriteable)
        return <CurrentValue format={value.format} label={value.label} value={value.value} fluid />
    return (
        
        <EditableInput
            min={value.min} max={value.max} step={value.step}
            format={value.format}
            value={displayValue}
            fluid
            onChange={onChange}
            action={<CurrentValue value={value.value} label={value.label} format={value.format} />}
            actionPosition='left'
        />
    )
}

export default INDINumber
