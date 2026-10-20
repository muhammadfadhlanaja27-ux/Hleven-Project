<?php

declare(strict_types=1);

namespace League\Flysystem\AwsS3V3;

use Aws\Api\DateTimeResult;
use Aws\S3\S3ClientInterface;
<<<<<<< HEAD
use Generator;
=======
use DateTimeInterface;
use Generator;
use League\Flysystem\ChecksumAlgoIsNotSupported;
use League\Flysystem\ChecksumProvider;
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
use League\Flysystem\Config;
use League\Flysystem\DirectoryAttributes;
use League\Flysystem\FileAttributes;
use League\Flysystem\FilesystemAdapter;
use League\Flysystem\FilesystemOperationFailed;
use League\Flysystem\PathPrefixer;
use League\Flysystem\StorageAttributes;
use League\Flysystem\UnableToCheckDirectoryExistence;
use League\Flysystem\UnableToCheckFileExistence;
use League\Flysystem\UnableToCopyFile;
<<<<<<< HEAD
use League\Flysystem\UnableToDeleteFile;
use League\Flysystem\UnableToMoveFile;
=======
use League\Flysystem\UnableToDeleteDirectory;
use League\Flysystem\UnableToDeleteFile;
use League\Flysystem\UnableToGeneratePublicUrl;
use League\Flysystem\UnableToGenerateTemporaryUrl;
use League\Flysystem\UnableToMoveFile;
use League\Flysystem\UnableToProvideChecksum;
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
use League\Flysystem\UnableToReadFile;
use League\Flysystem\UnableToRetrieveMetadata;
use League\Flysystem\UnableToSetVisibility;
use League\Flysystem\UnableToWriteFile;
<<<<<<< HEAD
=======
use League\Flysystem\UrlGeneration\PublicUrlGenerator;
use League\Flysystem\UrlGeneration\TemporaryUrlGenerator;
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
use League\Flysystem\Visibility;
use League\MimeTypeDetection\FinfoMimeTypeDetector;
use League\MimeTypeDetection\MimeTypeDetector;
use Psr\Http\Message\StreamInterface;
use Throwable;
<<<<<<< HEAD

use function trim;

class AwsS3V3Adapter implements FilesystemAdapter
=======
use function trim;

class AwsS3V3Adapter implements FilesystemAdapter, PublicUrlGenerator, ChecksumProvider, TemporaryUrlGenerator
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
{
    /**
     * @var string[]
     */
    public const AVAILABLE_OPTIONS = [
        'ACL',
        'CacheControl',
        'ContentDisposition',
        'ContentEncoding',
        'ContentLength',
        'ContentType',
        'Expires',
        'GrantFullControl',
        'GrantRead',
        'GrantReadACP',
        'GrantWriteACP',
        'Metadata',
        'MetadataDirective',
        'RequestPayer',
        'SSECustomerAlgorithm',
        'SSECustomerKey',
        'SSECustomerKeyMD5',
        'SSEKMSKeyId',
        'ServerSideEncryption',
        'StorageClass',
        'Tagging',
        'WebsiteRedirectLocation',
<<<<<<< HEAD
=======
        'ChecksumAlgorithm',
        'CopySourceSSECustomerAlgorithm',
        'CopySourceSSECustomerKey',
        'CopySourceSSECustomerKeyMD5',
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
    ];
    /**
     * @var string[]
     */
<<<<<<< HEAD
=======
    public const MUP_AVAILABLE_OPTIONS = [
        'add_content_md5',
        'before_upload',
        'concurrency',
        'mup_threshold',
        'params',
        'part_size',
    ];

    /**
     * @var string[]
     */
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
    private const EXTRA_METADATA_FIELDS = [
        'Metadata',
        'StorageClass',
        'ETag',
        'VersionId',
    ];

<<<<<<< HEAD
    /**
     * @var S3ClientInterface
     */
    private $client;

    /**
     * @var PathPrefixer
     */
    private $prefixer;

    /**
     * @var string
     */
    private $bucket;

    /**
     * @var VisibilityConverter
     */
    private $visibility;

    /**
     * @var MimeTypeDetector
     */
    private $mimeTypeDetector;

    /**
     * @var array
     */
    private $options;

    /**
     * @var bool
     */
    private $streamReads;

    public function __construct(
        S3ClientInterface $client,
        string $bucket,
        string $prefix = '',
        VisibilityConverter $visibility = null,
        MimeTypeDetector $mimeTypeDetector = null,
        array $options = [],
        bool $streamReads = true
    ) {
        $this->client = $client;
        $this->prefixer = new PathPrefixer($prefix);
        $this->bucket = $bucket;
        $this->visibility = $visibility ?: new PortableVisibilityConverter();
        $this->mimeTypeDetector = $mimeTypeDetector ?: new FinfoMimeTypeDetector();
        $this->options = $options;
        $this->streamReads = $streamReads;
=======
    private PathPrefixer $prefixer;
    private VisibilityConverter $visibility;
    private MimeTypeDetector $mimeTypeDetector;

    public function __construct(
        private S3ClientInterface $client,
        private string $bucket,
        string $prefix = '',
        ?VisibilityConverter $visibility = null,
        ?MimeTypeDetector $mimeTypeDetector = null,
        private array $options = [],
        private bool $streamReads = true,
        private array $forwardedOptions = self::AVAILABLE_OPTIONS,
        private array $metadataFields = self::EXTRA_METADATA_FIELDS,
        private array $multipartUploadOptions = self::MUP_AVAILABLE_OPTIONS,
    ) {
        $this->prefixer = new PathPrefixer($prefix);
        $this->visibility = $visibility ?? new PortableVisibilityConverter();
        $this->mimeTypeDetector = $mimeTypeDetector ?? new FinfoMimeTypeDetector();
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
    }

    public function fileExists(string $path): bool
    {
        try {
<<<<<<< HEAD
            return $this->client->doesObjectExist($this->bucket, $this->prefixer->prefixPath($path), $this->options);
=======
            return $this->client->doesObjectExistV2($this->bucket, $this->prefixer->prefixPath($path), false, $this->options);
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        } catch (Throwable $exception) {
            throw UnableToCheckFileExistence::forLocation($path, $exception);
        }
    }

    public function directoryExists(string $path): bool
    {
        try {
            $prefix = $this->prefixer->prefixDirectoryPath($path);
<<<<<<< HEAD
            $options = ['Bucket' => $this->bucket, 'Prefix' => $prefix, 'Delimiter' => '/'];
            $command = $this->client->getCommand('ListObjects', $options);

            return $this->client->execute($command)->hasKey('Contents');
=======
            $options = ['Bucket' => $this->bucket, 'Prefix' => $prefix, 'MaxKeys' => 1, 'Delimiter' => '/'];
            $command = $this->client->getCommand('ListObjectsV2', $options);
            $result = $this->client->execute($command);

            return $result->hasKey('Contents') || $result->hasKey('CommonPrefixes');
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        } catch (Throwable $exception) {
            throw UnableToCheckDirectoryExistence::forLocation($path, $exception);
        }
    }

    public function write(string $path, string $contents, Config $config): void
    {
        $this->upload($path, $contents, $config);
    }

    /**
     * @param string          $path
     * @param string|resource $body
     * @param Config          $config
     */
    private function upload(string $path, $body, Config $config): void
    {
        $key = $this->prefixer->prefixPath($path);
        $options = $this->createOptionsFromConfig($config);
<<<<<<< HEAD
        $acl = $options['ACL'] ?? $this->determineAcl($config);
        $shouldDetermineMimetype = $body !== '' && ! array_key_exists('ContentType', $options);

        if ($shouldDetermineMimetype && $mimeType = $this->mimeTypeDetector->detectMimeType($key, $body)) {
            $options['ContentType'] = $mimeType;
        }

        try {
            $this->client->upload($this->bucket, $key, $body, $acl, ['params' => $options]);
        } catch (Throwable $exception) {
            throw UnableToWriteFile::atLocation($path, '', $exception);
=======
        $acl = $options['params']['ACL'] ?? $this->determineAcl($config);
        $shouldDetermineMimetype = ! array_key_exists('ContentType', $options['params']);

        if ($shouldDetermineMimetype && $mimeType = $this->mimeTypeDetector->detectMimeType($key, $body)) {
            $options['params']['ContentType'] = $mimeType;
        }

        try {
            $this->client->upload($this->bucket, $key, $body, $acl, $options);
        } catch (Throwable $exception) {
            throw UnableToWriteFile::atLocation($path, $exception->getMessage(), $exception);
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        }
    }

    private function determineAcl(Config $config): string
    {
        $visibility = (string) $config->get(Config::OPTION_VISIBILITY, Visibility::PRIVATE);

        return $this->visibility->visibilityToAcl($visibility);
    }

    private function createOptionsFromConfig(Config $config): array
    {
<<<<<<< HEAD
        $options = [];

        foreach (static::AVAILABLE_OPTIONS as $option) {
=======
        $config = $config->withDefaults($this->options);
        $options = ['params' => []];

        if ($mimetype = $config->get('mimetype')) {
            $options['params']['ContentType'] = $mimetype;
        }

        foreach ($this->forwardedOptions as $option) {
            $value = $config->get($option, '__NOT_SET__');

            if ($value !== '__NOT_SET__') {
                $options['params'][$option] = $value;
            }
        }

        foreach ($this->multipartUploadOptions as $option) {
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
            $value = $config->get($option, '__NOT_SET__');

            if ($value !== '__NOT_SET__') {
                $options[$option] = $value;
            }
        }

<<<<<<< HEAD
        return $options + $this->options;
=======
        return $options;
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
    }

    public function writeStream(string $path, $contents, Config $config): void
    {
        $this->upload($path, $contents, $config);
    }

    public function read(string $path): string
    {
        $body = $this->readObject($path, false);

        return (string) $body->getContents();
    }

    public function readStream(string $path)
    {
        /** @var resource $resource */
        $resource = $this->readObject($path, true)->detach();

        return $resource;
    }

    public function delete(string $path): void
    {
        $arguments = ['Bucket' => $this->bucket, 'Key' => $this->prefixer->prefixPath($path)];
        $command = $this->client->getCommand('DeleteObject', $arguments);

        try {
            $this->client->execute($command);
        } catch (Throwable $exception) {
<<<<<<< HEAD
            throw UnableToDeleteFile::atLocation($path, '', $exception);
=======
            throw UnableToDeleteFile::atLocation($path, $exception->getMessage(), $exception);
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        }
    }

    public function deleteDirectory(string $path): void
    {
        $prefix = $this->prefixer->prefixPath($path);
        $prefix = ltrim(rtrim($prefix, '/') . '/', '/');
<<<<<<< HEAD
        $this->client->deleteMatchingObjects($this->bucket, $prefix);
=======

        try {
            $this->client->deleteMatchingObjects($this->bucket, $prefix);
        } catch (Throwable $exception) {
            throw UnableToDeleteDirectory::atLocation($path, $exception->getMessage(), $exception);
        }
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
    }

    public function createDirectory(string $path, Config $config): void
    {
<<<<<<< HEAD
        $config = $config->withDefaults(['visibility' => $this->visibility->defaultForDirectories()]);
=======
        $defaultVisibility = $config->get(Config::OPTION_DIRECTORY_VISIBILITY, $this->visibility->defaultForDirectories());
        $config = $config->withDefaults([Config::OPTION_VISIBILITY => $defaultVisibility]);
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        $this->upload(rtrim($path, '/') . '/', '', $config);
    }

    public function setVisibility(string $path, string $visibility): void
    {
        $arguments = [
            'Bucket' => $this->bucket,
            'Key' => $this->prefixer->prefixPath($path),
            'ACL' => $this->visibility->visibilityToAcl($visibility),
        ];
        $command = $this->client->getCommand('PutObjectAcl', $arguments);

        try {
            $this->client->execute($command);
        } catch (Throwable $exception) {
<<<<<<< HEAD
            throw UnableToSetVisibility::atLocation($path, '', $exception);
=======
            throw UnableToSetVisibility::atLocation($path, $exception->getMessage(), $exception);
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        }
    }

    public function visibility(string $path): FileAttributes
    {
        $arguments = ['Bucket' => $this->bucket, 'Key' => $this->prefixer->prefixPath($path)];
        $command = $this->client->getCommand('GetObjectAcl', $arguments);

        try {
            $result = $this->client->execute($command);
        } catch (Throwable $exception) {
<<<<<<< HEAD
            throw UnableToRetrieveMetadata::visibility($path, '', $exception);
=======
            throw UnableToRetrieveMetadata::visibility($path, $exception->getMessage(), $exception);
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        }

        $visibility = $this->visibility->aclToVisibility((array) $result->get('Grants'));

        return new FileAttributes($path, null, $visibility);
    }

    private function fetchFileMetadata(string $path, string $type): FileAttributes
    {
<<<<<<< HEAD
        $arguments = ['Bucket' => $this->bucket, 'Key' => $this->prefixer->prefixPath($path)];
        $command = $this->client->getCommand('HeadObject', $arguments);
=======
        $options = ['Bucket' => $this->bucket, 'Key' => $this->prefixer->prefixPath($path)];
        $command = $this->client->getCommand('HeadObject', $options + $this->options);
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35

        try {
            $result = $this->client->execute($command);
        } catch (Throwable $exception) {
<<<<<<< HEAD
            throw UnableToRetrieveMetadata::create($path, $type, '', $exception);
=======
            throw UnableToRetrieveMetadata::create($path, $type, $exception->getMessage(), $exception);
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        }

        $attributes = $this->mapS3ObjectMetadata($result->toArray(), $path);

        if ( ! $attributes instanceof FileAttributes) {
            throw UnableToRetrieveMetadata::create($path, $type, '');
        }

        return $attributes;
    }

<<<<<<< HEAD
    private function mapS3ObjectMetadata(array $metadata, string $path = null): StorageAttributes
    {
        if ($path === null) {
            $path = $this->prefixer->stripPrefix($metadata['Key'] ?? $metadata['Prefix']);
        }

=======
    private function mapS3ObjectMetadata(array $metadata, string $path): StorageAttributes
    {
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        if (substr($path, -1) === '/') {
            return new DirectoryAttributes(rtrim($path, '/'));
        }

        $mimetype = $metadata['ContentType'] ?? null;
        $fileSize = $metadata['ContentLength'] ?? $metadata['Size'] ?? null;
        $fileSize = $fileSize === null ? null : (int) $fileSize;
        $dateTime = $metadata['LastModified'] ?? null;
        $lastModified = $dateTime instanceof DateTimeResult ? $dateTime->getTimeStamp() : null;

        return new FileAttributes(
<<<<<<< HEAD
            $path, $fileSize, null, $lastModified, $mimetype, $this->extractExtraMetadata($metadata)
=======
            $path,
            $fileSize,
            null,
            $lastModified,
            $mimetype,
            $this->extractExtraMetadata($metadata)
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        );
    }

    private function extractExtraMetadata(array $metadata): array
    {
        $extracted = [];

<<<<<<< HEAD
        foreach (static::EXTRA_METADATA_FIELDS as $field) {
=======
        foreach ($this->metadataFields as $field) {
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
            if (isset($metadata[$field]) && $metadata[$field] !== '') {
                $extracted[$field] = $metadata[$field];
            }
        }

        return $extracted;
    }

    public function mimeType(string $path): FileAttributes
    {
        $attributes = $this->fetchFileMetadata($path, FileAttributes::ATTRIBUTE_MIME_TYPE);

        if ($attributes->mimeType() === null) {
            throw UnableToRetrieveMetadata::mimeType($path);
        }

        return $attributes;
    }

    public function lastModified(string $path): FileAttributes
    {
        $attributes = $this->fetchFileMetadata($path, FileAttributes::ATTRIBUTE_LAST_MODIFIED);

        if ($attributes->lastModified() === null) {
            throw UnableToRetrieveMetadata::lastModified($path);
        }

        return $attributes;
    }

    public function fileSize(string $path): FileAttributes
    {
        $attributes = $this->fetchFileMetadata($path, FileAttributes::ATTRIBUTE_FILE_SIZE);

        if ($attributes->fileSize() === null) {
            throw UnableToRetrieveMetadata::fileSize($path);
        }

        return $attributes;
    }

    public function listContents(string $path, bool $deep): iterable
    {
        $prefix = trim($this->prefixer->prefixPath($path), '/');
<<<<<<< HEAD
        $prefix = empty($prefix) ? '' : $prefix . '/';
=======
        $prefix = $prefix === '' ? '' : $prefix . '/';
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        $options = ['Bucket' => $this->bucket, 'Prefix' => $prefix];

        if ($deep === false) {
            $options['Delimiter'] = '/';
        }

        $listing = $this->retrievePaginatedListing($options);

        foreach ($listing as $item) {
<<<<<<< HEAD
            yield $this->mapS3ObjectMetadata($item);
=======
            $key = $item['Key'] ?? $item['Prefix'];

            if ($key === $prefix) {
                continue;
            }

            yield $this->mapS3ObjectMetadata($item, $this->prefixer->stripPrefix($key));
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        }
    }

    private function retrievePaginatedListing(array $options): Generator
    {
<<<<<<< HEAD
        $resultPaginator = $this->client->getPaginator('ListObjects', $options + $this->options);

        foreach ($resultPaginator as $result) {
            yield from ($result->get('CommonPrefixes') ?: []);
            yield from ($result->get('Contents') ?: []);
=======
        $resultPaginator = $this->client->getPaginator('ListObjectsV2', $options + $this->options);

        foreach ($resultPaginator as $result) {
            yield from ($result->get('CommonPrefixes') ?? []);
            yield from ($result->get('Contents') ?? []);
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        }
    }

    public function move(string $source, string $destination, Config $config): void
    {
<<<<<<< HEAD
=======
        if ($source === $destination) {
            return;
        }

>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        try {
            $this->copy($source, $destination, $config);
            $this->delete($source);
        } catch (FilesystemOperationFailed $exception) {
            throw UnableToMoveFile::fromLocationTo($source, $destination, $exception);
        }
    }

    public function copy(string $source, string $destination, Config $config): void
    {
<<<<<<< HEAD
        try {
            /** @var string $visibility */
            $visibility = $this->visibility($source)->visibility();
=======
        if ($source === $destination) {
            return;
        }

        try {
            $visibility = $config->get(Config::OPTION_VISIBILITY);

            if ($visibility === null && $config->get(Config::OPTION_RETAIN_VISIBILITY, true)) {
                $visibility = $this->visibility($source)->visibility();
            }
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        } catch (Throwable $exception) {
            throw UnableToCopyFile::fromLocationTo(
                $source,
                $destination,
                $exception
            );
        }

<<<<<<< HEAD
=======
        $options = $this->createOptionsFromConfig($config);
        $options['MetadataDirective'] = $config->get('MetadataDirective', 'COPY');
        $acl = $options['params']['ACL'] ?? $this->visibility->visibilityToAcl($visibility ?: 'private');

>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        try {
            $this->client->copy(
                $this->bucket,
                $this->prefixer->prefixPath($source),
                $this->bucket,
                $this->prefixer->prefixPath($destination),
<<<<<<< HEAD
                $this->visibility->visibilityToAcl($visibility),
                $this->createOptionsFromConfig($config)
=======
                $acl,
                $options,
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
            );
        } catch (Throwable $exception) {
            throw UnableToCopyFile::fromLocationTo($source, $destination, $exception);
        }
    }

    private function readObject(string $path, bool $wantsStream): StreamInterface
    {
        $options = ['Bucket' => $this->bucket, 'Key' => $this->prefixer->prefixPath($path)];

        if ($wantsStream && $this->streamReads && ! isset($this->options['@http']['stream'])) {
            $options['@http']['stream'] = true;
        }

        $command = $this->client->getCommand('GetObject', $options + $this->options);

        try {
            return $this->client->execute($command)->get('Body');
        } catch (Throwable $exception) {
<<<<<<< HEAD
            throw UnableToReadFile::fromLocation($path, '', $exception);
=======
            throw UnableToReadFile::fromLocation($path, $exception->getMessage(), $exception);
        }
    }

    public function publicUrl(string $path, Config $config): string
    {
        $location = $this->prefixer->prefixPath($path);

        try {
            return $this->client->getObjectUrl($this->bucket, $location);
        } catch (Throwable $exception) {
            throw UnableToGeneratePublicUrl::dueToError($path, $exception);
        }
    }

    public function checksum(string $path, Config $config): string
    {
        $algo = $config->get('checksum_algo', 'etag');

        if ($algo !== 'etag') {
            throw new ChecksumAlgoIsNotSupported();
        }

        try {
            $metadata = $this->fetchFileMetadata($path, 'checksum')->extraMetadata();
        } catch (UnableToRetrieveMetadata $exception) {
            throw new UnableToProvideChecksum($exception->reason(), $path, $exception);
        }

        if ( ! isset($metadata['ETag'])) {
            throw new UnableToProvideChecksum('ETag header not available.', $path);
        }

        return trim($metadata['ETag'], '"');
    }

    public function temporaryUrl(string $path, DateTimeInterface $expiresAt, Config $config): string
    {
        try {
            $options = $config->get('get_object_options', []);
            $command = $this->client->getCommand('GetObject', [
                    'Bucket' => $this->bucket,
                    'Key' => $this->prefixer->prefixPath($path),
                ] + $options);

            $presignedRequestOptions = $config->get('presigned_request_options', []);
            $request = $this->client->createPresignedRequest($command, $expiresAt, $presignedRequestOptions);

            return (string) $request->getUri();
        } catch (Throwable $exception) {
            throw UnableToGenerateTemporaryUrl::dueToError($path, $exception);
>>>>>>> b91c7a08855bc24a1e6e6694401977bc675aca35
        }
    }
}
