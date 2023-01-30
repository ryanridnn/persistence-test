import _ from 'lodash'

export default async function persistData(
    operationId: any,
    defaultPerMode: any,
    components: any,
    submissionData: any,
): Promise < any > {
    const opComponents: any[] = [];
    const opiComponents: any[] = [];

    const extractPersistedValue = (component: {
        perMode: 'op' | 'opi' | 'def';
        path: string;
    }) => {
        if (
            component.perMode === 'op' ||
            (component.perMode === 'def' && defaultPerMode === 'op')
        ) {

            opComponents.push(component);
            opiComponents.push(component);
        } else if (
            component.perMode === 'opi' ||
            (component.perMode === 'def' && defaultPerMode === 'opi')
        ) {
            opiComponents.push(component);
        }
    };

    const extract = (cs: any, path = '', isArray = false) => {
        const _cs = cs.map((c: any) => {
            return {
                type: c.type,
                key: c.key,
                perMode: c.perMode || 'def',
                components: c?.components || [],
            };
        });
        const fieldValue = _.get(submissionData, path);
        if (isArray) {
            // field is array container
            if (_.isArray(fieldValue)) {
                new Array(fieldValue.length).fill(0).forEach((x, fieldIndex) => {
                    // extra all array
                    const _path = path + '.[' + fieldIndex + ']';
                    _cs.forEach((c: any) => {
                        if (c.components && c.components.length) {
                            extract(
                                c.components,
                                _path ? _path + '.' + c.key : c.key,
                                !!c.components.length,
                            );
                        } else {
                            extractPersistedValue({
                                perMode: c.perMode,
                                path: _path + '.' + c.key,
                            }); // is single field extract single value
                        }
                    });
                });
            } else {
                // field is object container extra all array
                _cs.forEach((c: any) => {
                    if (c.components && c.components.length) {
                        extract(
                            c.components,
                            path ? path + '.' + c.key : c.key,
                            !!c.components.length,
                        );
                    } else {
                        // is single field/ extract single value
                        extractPersistedValue({
                            perMode: c.perMode,
                            path: path + '.' + c.key,
                        });
                    }
                });
            }
        } else {
            _cs.forEach((c: any) => {
                if (c.components && c.components.length) {
                    extract(
                        c.components,
                        path ? path + '.' + c.key : c.key,
                        !!c.components.length,
                    );
                } else {
                    extractPersistedValue({
                        perMode: c.perMode,
                        path: path ? path + '.' + c.key : c.key,
                    }); // is single field extract single value
                }
            });
        }
    };

    extract(components);

    const opData = { components: opComponents, data: {} };
    const opiData = { components: opiComponents, data: {} };

    for(const groupData of [opData, opiData]) {
        for (const component of groupData.components) {
            const val = _.get(submissionData, component.path, null);
            if (val !== null) {
                _.set(groupData.data, component.path, val);
            }
        }
    }
    // await this.operationModel
    //     .updateOne({ _id: operationId }, { submission: opData.data })
    //     .exec();
    // return new Promise((resolve) => resolve(opiData.data));
    console.log(components, submissionData, opiData.data)
}
