from __future__ import absolute_import

from rest_framework.negotiation import DefaultContentNegotiation
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from sentry.api.base import DocSection, Endpoint
from sentry.api.bases.project import ProjectPermission
from sentry.api.serializers import serialize
from sentry.models import File, Release, ReleaseFile


class ConditionalContentNegotiation(DefaultContentNegotiation):
    """
    Overrides the parsers on POST to support file uploads.
    """
    def select_parser(self, request, parsers):
        if request.method == 'POST':
            parsers = [FormParser(), MultiPartParser()]

        return super(ConditionalContentNegotiation, self).select_parser(
            request, parsers
        )


class ReleaseFilesEndpoint(Endpoint):
    doc_section = DocSection.RELEASES

    content_negotiation_class = ConditionalContentNegotiation
    permission_classes = (ProjectPermission,)

    def get(self, request, release_id):
        """
        List a release's files

        Retrieve a list of files for a given release.

            {method} {path}

        """
        release = Release.objects.get(id=release_id)

        self.check_object_permissions(request, release.project)

        file_list = list(ReleaseFile.objects.filter(
            release=release,
        ).select_related('file').order_by('name'))

        return Response(serialize(file_list, request.user))

    def post(self, request, release_id):
        """
        Upload a new file

        Upload a new file for the given release.

            {method} {path}
            name=http%3A%2F%2Fexample.com%2Fapplication.js

            # ...

        Unlike other API requests, files must be uploaded using the traditional
        multipart/form-data content-type.

        The optional 'name' attribute should reflect the absolute path that this
        file will be referenced as. For example, in the case of JavaScript you
        might specify the full web URI.
        """
        release = Release.objects.get(id=release_id)

        self.check_object_permissions(request, release.project)

        if 'file' not in request.FILES:
            return Response(status=400)

        fileobj = request.FILES['file']

        full_name = request.DATA.get('name', fileobj.name)
        name = full_name.rsplit('/', 1)[-1]

        file = File(
            name=name,
            type='source',
            headers={
                'Content-Type': fileobj.content_type,
            }
        )
        file.putfile(fileobj)

        releasefile = ReleaseFile.objects.create(
            project=release.project,
            release=release,
            file=file,
            name=full_name,
        )

        return Response(serialize(releasefile, request.user), status=201)