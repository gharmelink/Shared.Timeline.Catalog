Public Class ConstituentTimelineUIModel

    Private Sub ConstituentTimelineUIModel_Loaded(ByVal sender As Object, ByVal e As Blackbaud.AppFx.UIModeling.Core.LoadedEventArgs) Handles Me.Loaded
		_contextid.Value = Me.RecordId.ToString
		MyBase.UserInterfaceUrl = "browser/htmlforms/custom/share.timeline/ConstituentTimeLineUIModel.html"
	End Sub

End Class