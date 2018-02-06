import Utils from "../Utils.js";

/**
 * Abstract base class for operators.
 */
export default class Operator
{
    /**
     * Constructs new Operator.
     * @param name
     * @param stage
     * @param inputCardinality
     * @param outputCardinality
     * @param dataset Instance of Dataset class. Holds exactly one dataset.
     * @param parentDivID
     */
    constructor(name, stage, inputCardinality, outputCardinality, dataset, parentDivID)
    {
        this._name      = name;
        this._stage     = stage;
        this._panels    = {};
        this._target    = Utils.uuidv4();

        this._inputCardinality  = inputCardinality;
        this._outputCardinality = outputCardinality;
        this._dataset           = dataset;

        // Create div structure for this operator.
        let div         = document.createElement('div');
        div.id          = this._target;
        div.className   = 'operator filter-reduce-operator';
        $("#" + (typeof parentDivID == "undefined" ? this._stage.target : parentDivID)).append(div);

        // Make class abstract.
        if (new.target === Operator) {
            throw new TypeError("Cannot construct Operator instances.");
        }
    }

    /**
     * Constructs all panels in this operator.
     */
    constructPanels()
    {
        throw new TypeError("Operator.constructPanels(): Abstract method must not be called.");
    }

    get name()
    {
        return this._name;
    }

    get panels()
    {
        return this._panels;
    }

    get inputCardinality()
    {
        return this._inputCardinality;
    }

    get outputCardinality()
    {
        return this._outputCardinality;
    }

    get dataset()
    {
        return this._dataset;
    }

    get stage()
    {
        return this._stage;
    }

    get target()
    {
        return this._target;
    }
}