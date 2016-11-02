/**
 * @file elementInstanceManager.js
 * @author Zishan Iqbal
 * @description This file includes the CURD operations for the elementInstance Model.
 */

import BaseManager from './../managers/baseManager';
import ElementInstance from './../models/elementInstance';
import DataTracks from './../models/dataTracks';
import sequelize from './../utils/sequelize';
import AppUtils from '../utils/appUtils';

class ElementInstanceManager extends BaseManager {

	getEntity() {
		return ElementInstance;
	}

	/**
	 * @desc - updates the elementInstance which has the coresponding uuid
	 * @param Integer, JSON object - uuid, data
	 * @return Integer - returns the number of rows updated
	 */
	updateByUUID(uuid, data) {
			return ElementInstance.update(data, {
				where: {
					uuid: uuid
				}
			});
		}
		/**
		 * @desc - uses a raw-query to join element_instance and data_tracks
		 * @param Integer - instanceId
		 * @return JSON - returns a Array of JSON objects with elementInstance and its related dataTracks
		 */
	findByInstanceId(instanceId) {
		var instanceConfigQuery = "SELECT i.*, t.is_activated FROM element_instance i LEFT JOIN data_tracks t ON (i.track_id = t.ID) WHERE i.iofabric_uuid = " + instanceId + " AND (i.track_id = 0 OR t.is_activated = 1)";
		return sequelize.query(instanceConfigQuery);
	}

	findByUuId(uuid) {
		return ElementInstance.find({
			where: {
				uuid: uuid
			}
		});
	}

	findByTrackId(trackId) {
		return ElementInstance.findAll({
			where: {
				trackId: trackId
			}
		});
	}

	createElementInstance(element) {
		return ElementInstance.create(element);
	}

	createElementInstance(element, userId, trackId, elementName, logSize) {
		var elementInstance = {
			uuid: AppUtils.generateInstanceId(32),
			trackId: trackId,
			elementKey: element.id,
			config: "{}",
			name: elementName,
			last_updated: new Date().getTime(),
			updatedBy: userId,
			configLastUpdated: new Date().getTime(),
			isStreamViewer: false,
			isDebugConsole: false,
			isManager: false,
			isNetwork: false,
			registryId: element.registry_id,
			rebuild: false,
			RootHostAccess: false,
			logSize: logSize
		};

		return ElementInstance.create(elementInstance);
	}

	createStreamViewerInstance(streamViewerElementKey, userId, fabricInstanceId) {
		var elementInstance = {
			uuid: AppUtils.generateInstanceId(32),
			trackId: 0,
			elementKey: streamViewerElementKey,
			config: '{"accesstoken":"' + AppUtils.generateInstanceId(32) + '","foldersizelimit":200.0}',
			name: 'Stream Viewer',
			last_updated: new Date().getTime(),
			updatedBy: userId,
			configLastUpdated: new Date().getTime(),
			isStreamViewer: true,
			isDebugConsole: false,
			isManager: false,
			isNetwork: false,
			registryId: null,
			rebuild: false,
			RootHostAccess: false,
			logSize: 50,
			iofabric_uuid: fabricInstanceId
		};

		return ElementInstance.create(elementInstance);
	}

	createNetworkInstance(element, userId, fabricInstanceId, satelliteDomain, satellitePort1, name, localPort) {
		var netConfig = {
				'mode': 'public',
				'host': satelliteDomain,
				'port': satellitePort1,
				'connectioncount': 60,
				'passcode': AppUtils.generateRandomString(32),
				'localhost': 'iofabric',
				'localport': localPort,
				'heartbeatfrequency': 20000,
				'heartbeatabsencethreshold': 60000
			},
			elementInstance = {
				uuid: AppUtils.generateInstanceId(32),
				trackId: 0,
				elementKey: element.id,
				config: JSON.stringify(netConfig),
				name: name,
				last_updated: new Date().getTime(),
				updatedBy: userId,
				configLastUpdated: new Date().getTime(),
				isStreamViewer: false,
				isDebugConsole: false,
				isManager: false,
				isNetwork: true,
				registryId: element.registry_id,
				rebuild: false,
				RootHostAccess: false,
				logSize: 50,
				iofabric_uuid: fabricInstanceId
			};

		return ElementInstance.create(elementInstance);
	}

	createDebugConsoleInstance(consoleElementKey, userId, fabricInstanceId) {
		var config = {
				'accesstoken': AppUtils.generateRandomString(32),
				'filesizelimit': 200.0
			},
			elementInstance = {
				uuid: AppUtils.generateInstanceId(32),
				trackId: 0,
				elementKey: consoleElementKey,
				config: JSON.stringify(config),
				name: 'Debug Console',
				last_updated: new Date().getTime(),
				updatedBy: userId,
				configLastUpdated: new Date().getTime(),
				isStreamViewer: false,
				isDebugConsole: true,
				isManager: false,
				isNetwork: false,
				registryId: null,
				rebuild: false,
				RootHostAccess: false,
				logSize: 50,
				iofabric_uuid: fabricInstanceId
			};

		return ElementInstance.create(elementInstance);
	}

	deleteNetworkElement(elementId) {
		var deleteQuery = ' \
			DELETE FROM element_instance \
			WHERE UUID IN( \
				SELECT networkElementId1 \
				FROM network_pairing \
				WHERE elementId1 = "' + elementId + '" \
			) \
			OR UUID IN( \
				SELECT networkElementId2 \
				FROM network_pairing \
				WHERE elementId1 = "' + elementId + '" \
			) \
		';

		return sequelize.query(deleteQuery);
	}

	deleteByElementUUID(instanceId) {
		return ElementInstance.destroy({
			where: {
				uuid: instanceId
			}
		});
	}
}

const instance = new ElementInstanceManager();
export default instance;