import { useEffect } from 'react'
import Notes from '../../../../../../../components/Notes/Notes'
import useAPI from '../../../../../../../hooks/useAPI'

const GroupNotes = ({ groupId }) => {
	const notesApi = useAPI()

	notesApi.init('notes', {
		filters: { type: 'landGroup', reference: groupId },
	})

	return <Notes entityType='landGroup' entityReference={groupId} notesData={notesApi.data?.notes || []} status={notesApi.isLoading} />
}

export default GroupNotes
